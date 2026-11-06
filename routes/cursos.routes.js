
const express = require("express")
const router = express.Router()
const db = require("../db").db

// -------- rotas do curso ----------
router.get("/cursos", async (req, res) =>{
    const [cursos] = await db.execute("SELECT * FROM curso")
    return res.json(cursos)
})

router.post("/cursos", async (req, res) => {
    const { nome, descricao, professorId } = req.body

    if (!nome || !descricao || !professorId) {
        return res.status(400).json({ error: "nome, descricao, professorId são obrigatórios" })
    }

    try {
        const [resultado] = await db.execute(
            "INSERT INTO curso (nome, descricao, professor_id) VALUES (?, ?, ?)",
            [nome, descricao, professorId]
        )

        return res.status(201).json({
            id: resultado.insertId,
            nome,
            descricao,
            professorId
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