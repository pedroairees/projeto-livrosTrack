const express = require("express");
const path = require("path");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.sqlite");
const bcrypt = require("bcrypt");
const session = require("express-session");

const app = express();

app.use(express.json());
app.use(cors());
app.use(
  session({ secret: "chavesecreta", resave: false, saveUninitialized: false })
);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "home.html"));
});
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});
app.get("/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "cadastro.html"));
});

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.redirect("/login");
  next();
}
app.get("/home", requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "home.html"));
});

app.use(express.static(path.join(__dirname, "public")));

const PORT = 3000;
app.listen(PORT, () =>
  console.log(`Servidor rodando em http://localhost:${PORT}`)
);
const livros = { andamento: [], concluido: [] };

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    nome TEXT NOT NULL,
    autor TEXT NOT NULL,
    status TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )`);
});

app.use(
  session({
    secret: "chavesecreta",
    resave: false,
    saveUninitialized: false,
  })
);

// Signup
app.post("/signup", (req, res) => {
  const { nome, email, password } = req.body;
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) return res.status(500).send("Erro no servidor");

    db.run(
      `INSERT INTO users (name,email,password) VALUES (?,?,?)`,
      [nome, email, hash],
      function (err) {
        if (err) return res.status(400).send("Email já cadastrado");
        req.session.userId = this.lastID;
        res.json({ success: true });
      }
    );
  });
});

// Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
    if (err) return res.status(500).json({ error: "Erro no servidor" });
    if (!user) return res.status(401).json({ error: "Usuário não cadastrado" });

    bcrypt.compare(password, user.password, (err, ok) => {
      if (err) return res.status(500).json({ error: "Erro no servidor" });
      if (!ok) return res.status(401).json({ error: "Senha incorreta" });

      req.session.userId = user.id;
      return res.status(200).json({ success: true });
    });
  });
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

function auth(req, res, next) {
  if (!req.session.userId) return res.status(401).send("Não autorizado");
  next();
}

app.post("/items", auth, (req, res) => {
  const { nome, autor, status } = req.body;
  db.run(
    `INSERT INTO items (user_id,nome,autor,status) VALUES (?,?,?,?)`,
    [req.session.userId, nome, autor, status],
    function (err) {
      if (err) return res.status(500).send("Erro ao salvar");
      res.json({ id: this.lastID });
    }
  );
});

app.get("/items", auth, (req, res) => {
  db.all(
    `SELECT * FROM items WHERE user_id = ?`,
    [req.session.userId],
    (err, rows) => res.json(rows)
  );
});

app.put("/items/:id", auth, (req, res) => {
  const { nome, autor, status } = req.body;
  const { id } = req.params;
  db.run(
    `UPDATE items SET nome = ?, autor = ?, status = ? WHERE id = ? AND user_id = ?`,
    [nome, autor, status, id, req.session.userId],
    function (err) {
      if (this.changes === 0) return res.status(404).send("Não encontrado");
      res.json({ success: true });
    }
  );
});

app.delete("/items/:id", auth, (req, res) => {
  const { id } = req.params;
  db.run(
    `DELETE FROM items WHERE id = ? AND user_id = ?`,
    [id, req.session.userId],
    function (err) {
      if (this.changes === 0) return res.status(404).send("Não encontrado");
      res.json({ success: true });
    }
  );
});

app.use(express.static(path.join(__dirname, "public")));

app.post("/adicionar", (req, res) => {
  const { nome, autor, status } = req.body;
  if (!nome || !autor || !status)
    return res.status(400).json({ erro: "Dados incompletos" });
  livros[status].push({ nome, autor });
  return res.status(201).json({ mensagem: "Livro adicionado!" });
});

app.get("/livros", (req, res) => {
  return res.json(livros);
});

app.put("/items/:id/status", auth, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  db.run(
    `UPDATE items SET status = ? WHERE id = ? AND user_id = ?`,
    [status, id, req.session.userId],
    function (err) {
      if (err) return res.status(500).send("Erro ao atualizar status");
      if (this.changes === 0)
        return res.status(404).send("Livro não encontrado");
      res.json({ success: true });
    }
  );
});
