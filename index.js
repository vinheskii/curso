const express = require("express")
const mysql =  require ("mysql2/promise")
const app = express()
const rotasProfessores = require("./routes/professores.routes")
app.use(express.json())

app.use("/professores", async (req, res) => {
    const [professores] = await db.execute("SELECT * FROM professor")
    return res.json(professores)
})

// conectar com o banco de dados
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "root",
    database: "escola"
})

//  -------- rotas do professor ---------
app.get("/professores", async (req, res) => {
    const [professores] = await db.execute("SELECT * FROM professor")
    return res.json(professores)
})

app.post("/professores", async (req, res) => {
    const { nome, especialidade } = req.body ?? {}

    if (typeof nome !== "string" || !nome.trim() || typeof especialidade !== "string" || !especialidade.trim()) {
        return res.status(400).json({ error: "Nome e especialidade sao obrigatorios" })
    }

    if (nome.trim().length <= 2) {
        return res.status(400).json({ error: "Nome precisava ter mais de 2 caracteres" })
    }

    const [resultado] = await db.execute(
        "INSERT INTO professor(nome, especialidade) VALUES (?, ?)",
        [nome.trim(), especialidade.trim()]
    )

    return res.status(201).json({ id: resultado.insertId, nome: nome.trim(), especialidade: especialidade.trim() })
})

// -------- rotas do curso ----------
app.get("/cursos", async (req, res) =>{
    const [cursos] = await db.execute("SELECT * FROM curso")
    return res.json(cursos)
})

app.post("/cursos", async (req, res) => {
    const { nome, descricao, professorId } = req.body ?? {}

    if (typeof nome !== "string" || !nome.trim() || typeof descricao !== "string" || !descricao.trim()) {
        return res.status(400).json({ error: "nome, descricao, professorId são obrigatórios" })
    }

    const idProfessor = Number(professorId)
    if (!Number.isInteger(idProfessor) || idProfessor <= 0) {
        return res.status(400).json({ error: "nome, descricao, professorId são obrigatórios" })
    }

    try {
        const [resultado] = await db.execute(
            "INSERT INTO curso (nome, descricao, professor_id) VALUES (?, ?, ?)",
            [nome.trim(), descricao.trim(), idProfessor]
        )

        return res.status(201).json({
            id: resultado.insertId,
            nome: nome.trim(),
            descricao: descricao.trim(),
            professorId: idProfessor
        })
    } catch (err) {
        console.error(err)

        // Chave estrangeira inválida (professor não existe)
        if (err.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(400).json({ error: "professorId não existe" })
        }

        return res.status(500).json({ error: "Erro ao criar curso" })
    }
})

app.delete("/cursos/:id", async (req, res) => {
    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({ error: "id invalido" })
    }

    const [resultado] = await db.execute(
        "DELETE FROM curso  WHERE id = ?",
        [id]
    )

    if (resultado.affectedRows === 0) {
        return res.status(404).json({ error: "curso nao encontrado!" })
    }

    return res.status(204).end()
})

app.use((err, req, res, next) => {
    console.error(err)

    if (res.headersSent) {
        return next(err)
    }

    return res.status(500).json({ error: "Erro interno do servidor" })
})

app.listen(3000, () => console.log("API no ar"))