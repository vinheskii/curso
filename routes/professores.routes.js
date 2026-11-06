
const express = require("express")
const router = express.Router()
const db = require("../db").db

// -------- rotas do professor ----------
router.get("/professores", async (req, res) =>{
    const [professores] = await db.execute("SELECT * FROM professor")
    return res.json(professores)
})

router.post("/professores", async (req, res) => {
    const { nome, especialidade } = req.body

    if (!nome || !especialidade) {
        return res.status(400).json({ error: "nome e especialidade são obrigatórios" })
    }

    try {
        const [resultado] = await db.execute(
            "INSERT INTO professor (nome, especialidade) VALUES (?, ?)",
            [nome, especialidade]
        )

        return res.status(201).json({
            id: resultado.insertId,
            nome,
            especialidade
        })
    } catch (err) {
        console.error(err)

        // Chave estrangeira inválida (professor não existe)
        if (err.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(400).json({ error: "professorId não existe" })
        }

        return res.status(500).json({ error: "Erro ao criar professor" })
    }
})