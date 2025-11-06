// Importando libs
import express from 'express'
import mongoose from 'mongoose'
import session from 'express-session'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import MongoStore from 'connect-mongo'
import { fileURLToPath } from 'url'

// Importando models
import User from './models/User.js'
import Profile from './models/Profile.js'
import Like from './models/Like.js'
import Match from './models/Match.js'

// Upload de fotos
import upload from './multer-config.js'

dotenv.config()

// Variáveis para servir arquivos estáticos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cálculo de idade com base no DOB (Date of birthday)
function calculateAge(dob) {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    // Diferança de ano
    let age = today.getFullYear() - birthDate.getFullYear();
    // Diferença de mês
    const monthDiff = today.getMonth() - birthDate.getMonth();
    // Cálculo preciso com base no mês e dia
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

const app = express()
const PORT = 3000

app.use(express.json())
// Habilita o servidor a devolver na response o Access-Control-Allow-Credentials header para utilizar sessões e autenticações
app.use(cors({
    origin: ['http://localhost:5173', 'http://10.0.0.105:5173', 'http://10.0.2.15:5173'],
    credentials: true
}))

// Entrega de arquivos estáticos com um diretório virtual '/uploads' mas passando o caminho absoluto de 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Cria e estabelece a conexão com o banco de dados
    // Rotas as rotas precisaram estar dentro da função startServer pois agora o middleware de autenticação é dependente de MongoStore.Create.
    // Portanto, precisa estar sendo da função assincrona para funcionar, e se colocasse apenas o checkAuth() dentro do startServer as rotas
    // ficariam com erro de autenticação
async function startServer() {
    try {
        // Faço a conexão para depois utilizar o middleware do connect-mongo
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('MongoDB connected successfully.')

        // Habilita o express-session
        // Cookie = ID + assinatura
        app.use(session({
            // Usa secret de hash para criar assinatura
            // Secret protege contra falsificação mas não contra roubo
            secret: 'sessionpassword123',
            name: 'uniqueSessionID',
            // Evita armazenar sessão vazia e sem modificações
            saveUninitialized: false,
            // Não força a sessão a ser salva no armazenamento de sessão novamente se não tiver sido modificada
            resave: false,
            // TTL é renovado a cada requisição
            rolling: true,
            // Solução usando connect-mongo para apagar as sessões
            // Antigas do servidor quando o TTL expirar
            store: MongoStore.create({
                client: mongoose.connection.getClient(),
                collectionName: 'sessions',
                ttl: 60 * 1 // Tempo em segundos
            }),
            // Configuração de cookies contra XSS
            cookie: {
                // Bloqueando acesso ao cookie via JS
                httpOnly: true,
                // Sessão expira em X minutos
                maxAge: 1000 * 60 * 1 // Tempo em milissegundos 
            }

        }))

        app.listen(PORT, () => {
            console.log(`Server working in port ${PORT}`)
        })

        // --- ROTAS PÚBLICAS ---

        // LOGIN USER -> faz a autenticação e criação da sessão
        app.post('/login', async (req, res) => {
            // Validação de parâmetros nulos
            const { email, password } = req.body
            if (email == "" || password == "") {
                return res.status(400).json({ Error: "Invalid parameters." })
            }

            // Valida existência do email no banco de dados
            const user = await User.findOne({ email: email })
            if (user == null) {
                return res.status(400).json({ Error: "Invalid email or password..." })
            }

            // Valida a senha com a função criada no model de Usuário pois ela está criptografada
            const correctLogin = await user.comparePassword(password);
            if (!correctLogin) {
                return res.status(400).json({ Error: "Invalid email or password..." })
            }

            // Busca o UserID na tabela de Perfil que contenha o ID o Usuário que está logando
            const profile = await Profile.findOne({ user: user._id });
            // No objeto da sessão crio propriedades para auxiliar na persistência da sessão
            req.session.loggedIn = true
            req.session.email = user.email
            req.session.profileId = user.profile
            console.log("Sessão criada:", req.session)

            res.status(200).json(profile);
        })

        // LOGOUT USER -> limpa o cookie de sessão para logout
        app.post('/logout', (req, res) => {
            // Exclui a sessão do servidor 
            // Recebe parâmetro de erro para que possa ser tratado
            req.session.destroy(err => {
                if (err) {
                    return res.status(500).json({ Error: "Não foi possível fazer logout." });
                }
                // Exclui o cookie do navegador que acessa a sessão
                res.clearCookie('uniqueSessionID');
                res.status(200).json({ Message: "Logout bem-sucedido." });
            });
        });

        // LOGOUT USER -> limpa o cookie de sessão para logout
        app.post('/logout', (req, res) => {
            // Exclui a sessão do servidor 
            // Recebe parâmetro de erro para que possa ser tratado
            req.session.destroy(err => {
                if (err) {
                    return res.status(500).json({ Error: "Não foi possível fazer logout." });
                }
                // Exclui o cookie do navegador que acessa a sessão
                res.clearCookie('uniqueSessionID');
                res.status(200).json({ Message: "Logout bem-sucedido." });
            });
        });

        // CREATE USER
        app.post('/register', upload.array('photos', 6), async (req, res) => {
            try {
                const {
                    email, password,
                    firstName, lastName, dob, bio, gender, seeking,
                    ageRangeMin, ageRangeMax
                } = req.body;

                if (!email || !password || !firstName || !lastName || !dob || !gender || !seeking || !ageRangeMin || !ageRangeMax) {
                    return res.status(400).json({ Message: "Todos os campos do perfil são obrigatórios." });
                }

                if (!req.files || req.files.length === 0) {
                    return res.status(400).json({ Message: "Pelo menos uma foto é obrigatória." });
                }

                const existingUser = await User.findOne({ email: email });
                if (existingUser != null) {
                    return res.status(400).json({ Message: "Este email já está em uso." });
                }

                const photoUrls = req.files.map(file => `http://localhost:3000/uploads/${file.filename}`);

                const newUser = await User.create({
                    email,
                    password
                });

                const newProfile = await Profile.create({
                    user: newUser._id,
                    firstName, lastName, dob, bio, gender, seeking,
                    photos: photoUrls,
                    ageRange: { min: ageRangeMin, max: ageRangeMax }
                });

                newUser.profile = newProfile._id;
                await newUser.save();

                req.session.loggedIn = true;
                req.session.profileId = newProfile._id;
                req.session.email = newUser.email;

                res.status(201).json({ Message: "Conta criada com sucesso!", user: newUser, profile: newProfile });

            } catch (error) {
                res.status(500).json({ Error: error.message });
            }
        });

         app.get('/debug-session', (req, res) => {
            res.json({
                sessionID: req.sessionID,
                sessionData: req.session
            })
        })

        // Middleware Authentication Check 
        function checkAuth(req, res, next) {
            if (req.session && req.session.loggedIn) next();
            else res.status(401).json({ Error: "Login required. Please authenticate" })
        }
        app.use(checkAuth)

        // --- ROTAS PRIVADAS ---

        //STATUS API
        app.get('/', (req, res) => {
            res.send('tinder api is working (e você está logado)')
        })

        // GET ALL USERS
        app.get('/users', async (req, res) => {
            try {
                let users = await User.find({}).select('-password').populate('profile');
                let count = await User.countDocuments()
                res.status(200).json({ Count: count, Users: users })
            }
            catch (error) {
                res.status(500).json({ Error: error })
            }
        })

        // GET USER BY ID
        app.get('/users/:id', async (req, res) => {
            try {
                const id = req.params.id
                if (!mongoose.isValidObjectId(id)) {
                    return res.status(400).json({ Error: "Invalid ObjectId." })
                }

                const user = await User.findById(id).select('-password').populate('profile');
                if (user == null) {
                    return res.status(400).json({ Error: "User not found." })
                }
                res.status(200).json({ User: user })
            }
            catch (error) {
                res.status(500).json({ Erro: error })
            }
        })

        // UPDATE USER BY ID
        app.put('/users/:id', async (req, res) => {
            const id = req.params.id;
            if (!mongoose.isValidObjectId(id)) {
                return res.status(400).json({ Error: "Invalid ObjectId." });
            }

            const { email, password } = req.body; // Esta rota ainda espera JSON
            if (!email && !password) {
                return res.status(400).json({ Error: "Invalid parameters." });
            }

            try {
                const user = await User.findById(id);
                if (user == null) {
                    return res.status(400).json({ Error: "User not found." });
                }

                if (email && email !== user.email) {
                    const userEmailVerify = await User.findOne({ email: email });
                    if (userEmailVerify != null) {
                        return res.status(400).json({ Error: "Email already exists." });
                    }
                    user.email = email;
                }

                if (password) {
                    user.password = password;
                }

                const updatedUser = await user.save();
                res.status(200).json({ Message: "User updated successfully." });
            } catch (error) {
                res.status(500).json({ Error: error.message });
            }
        });

        // DELETE USER BY ID
        app.delete('/users/:id', async (req, res) => {
            try {
                const id = req.params.id
                if (!mongoose.isValidObjectId(id)) {
                    return res.status(500).json({ Error: "Invalid Id Format." })
                }
                const user = await User.findByIdAndDelete(id)
                if (user == null) {
                    return res.status(400).json({ Error: "UserID not found." })
                }
                res.status(200).json({ Message: { UserID: id, Status: "Deleted successfully." } })
            }
            catch (error) {
                res.status(500).json({ Error: error })
            }
        })

        // LIKE PROFILE
        app.post('/like', async (req, res) => {
            try {
                const { targetProfileId } = req.body;
                const myProfileId = req.session.profileId;

                const myLike = await Like.create({
                    liker: myProfileId,
                    liked: targetProfileId
                });

                const reverseLike = await Like.findOne({
                    liker: targetProfileId,
                    liked: myProfileId
                });

                if (reverseLike) {
                    await Match.create({ profiles: [myProfileId, targetProfileId] });
                    res.status(201).json({ status: 'match', message: "It's a Match!" });
                } else {
                    res.status(201).json({ status: 'liked', message: "Like registrado." });
                }
            } catch (error) {
                if (error.code === 11000) {
                    return res.status(200).json({ status: 'liked', message: "Like já registrado." });
                }
                res.status(400).json({ Error: error.message });
            }
        });

        // GET MATCHES
        app.get('/matches', async (req, res) => {
            const myProfileId = req.session.profileId;
            const matches = await Match.find({
                profiles: myProfileId
            }).populate('profiles');

            res.status(200).json({ matches });
        });

        // GET PROFILE
        app.get('/me', async (req, res) => {
            try {
                const profileId = req.session.profileId;
                const profile = await Profile.findById(profileId).populate('user', 'email');
                if (!profile) {
                    return res.status(404).json({ Error: "Perfil não encontrado." });
                }
                res.status(200).json(profile);
            } catch (error) {
                res.status(500).json({ Error: error.message });
            }
        });

        // GET CANDIDATES
        app.get('/candidates', async (req, res) => {
            try {
                const myProfileId = req.session.profileId;

                const myProfile = await Profile.findById(myProfileId).select('seeking ageRange');
                if (!myProfile) {
                    return res.status(404).json({ Error: "Perfil do usuário não encontrado." });
                }

                const myLikes = await Like.find({ liker: myProfileId }).select('liked');
                const likedIds = myLikes.map(like => like.liked);
                likedIds.push(myProfileId);

                const maxBirthDate = new Date();
                maxBirthDate.setFullYear(maxBirthDate.getFullYear() - (myProfile.ageRange.min || 18));

                const minBirthDate = new Date();
                minBirthDate.setFullYear(minBirthDate.getFullYear() - (myProfile.ageRange.max || 99));

                const query = {
                    _id: { $nin: likedIds },
                    dob: { $gte: minBirthDate, $lte: maxBirthDate }
                };

                if (myProfile.seeking === 'homem') {
                    query.gender = 'homem';
                } else if (myProfile.seeking === 'mulher') {
                    query.gender = 'mulher';
                }

                const candidatesDocs = await Profile.find(query);

                const candidates = candidatesDocs.map(doc => {
                    const candidate = doc.toObject();
                    candidate.age = calculateAge(candidate.dob);
                    return candidate;
                });

                res.status(200).json(candidates);

            } catch (error) {
                res.status(500).json({ Error: error.message });
            }
        });

        // UPDATE PROFILE
        app.put('/profile', upload.array('photos', 6), async (req, res) => {
            try {
                const myProfileId = req.session.profileId;
                const { firstName, lastName, bio, dob, gender, seeking, ageRangeMin, ageRangeMax } = req.body;

                const updates = {
                    firstName, lastName, bio, dob, gender, seeking,
                    ageRange: {
                        min: ageRangeMin,
                        max: ageRangeMax
                    }
                };

                const updateOperation = { $set: updates };

                if (req.files && req.files.length > 0) {
                    const newPhotoUrls = req.files.map(file => `http://localhost:3000/uploads/${file.filename}`);
                    updateOperation.$push = { photos: { $each: newPhotoUrls } };
                }

                const updatedProfile = await Profile.findByIdAndUpdate(
                    myProfileId,
                    updateOperation,
                    { new: true }
                ).populate('user', 'email');

                if (!updatedProfile) {
                    return res.status(404).json({ Error: "Perfil não encontrado." });
                }
                res.status(200).json(updatedProfile);
            } catch (error) {
                res.status(500).json({ Error: error.message });
            }
        });

        // SET MAIN PROFILE PHOTO
        app.put('/profile/photos/set-main', async (req, res) => {
            try {
                const { photoUrl } = req.body;
                const myProfileId = req.session.profileId;

                if (!photoUrl) {
                    return res.status(400).json({ Error: "URL da foto é obrigatória." });
                }

                const profile = await Profile.findById(myProfileId);
                if (!profile) {
                    return res.status(404).json({ Error: "Perfil não encontrado." });
                }

                const photoIndex = profile.photos.indexOf(photoUrl);
                if (photoIndex === -1) {
                    return res.status(404).json({ Error: "Foto não encontrada no perfil." });
                }

                if (photoIndex === 0) {
                    return res.status(200).json(profile);
                }

                const [photoToMove] = profile.photos.splice(photoIndex, 1);

                profile.photos.unshift(photoToMove);

                const updatedProfile = await profile.save();

                const populatedProfile = await updatedProfile.populate('user', 'email');

                res.status(200).json(populatedProfile);

            } catch (error) {
                res.status(500).json({ Error: error.message });
            }
        });

    } catch (error) {
        console.log("Error connecting in MongoDB:", error)
    }
}
startServer()
