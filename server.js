
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/User'); 


const app = express();
app.use(express.json());


mongoose.connect('mongodb+srv://cleytonsouza476:Orap3q4srNRJ7xlz@api.uy8fa.mongodb.net/?retryWrites=true&w=majority&appName=api', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Conectado ao MongoDB'))
.catch((err) => console.error('Erro ao conectar ao MongoDB:', err));


app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'Usuário já existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({ message: 'Usuário registrado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao registrar usuário', error });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Usuário não encontrado' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Senha incorreta' });
    }

    const token = jwt.sign({ userId: user._id }, 'secreta_chave', { expiresIn: '1h' });

    res.status(200).json({ message: 'Autenticado com sucesso', token });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao autenticar usuário', error });
  }
});

app.get('/protected', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, 'secreta_chave');
    res.status(200).json({ message: 'Acesso permitido', userId: decoded.userId });
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
});

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
