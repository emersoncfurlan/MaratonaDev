var credentials = require('./credentials.json')
const express = require("express")
const server = express()

// configurando a template engine (nunjucks)
const nunjucks = require("nunjucks")
nunjucks.configure("./", { express: server, noCache: true, })

// habilitar body do formulario
server.use(express.urlencoded({ extended: true }))

// configurar servidor para aprensentar arquivos estaticos
server.use(express.static('public'))

// configurar a conexão com o banco de dados
const Pool = require('pg').Pool
const db = new Pool({
    user: credentials.user,
    password: credentials.password,
    host: credentials.host,
    port: credentials.port,
    database: credentials.database
})


// confugirar a apresentação da pagina
server.get("/", function (req, res) {
    db.query("SELECT name, email, blood FROM donors", function(err, result){
        if (err) return res.send("Erro no banco de dados.")
        const donors = result.rows
        return res.render("index.html", { donors })
    })
})

server.post("/", function (req, res) {
    // pegar dados do formulario
    const name = req.body.name
    const email = req.body.email
    const blood = req.body.blood

    if (name == "" || email == "" || blood == "") {
        return res.send("Todos os campos são obrigatórios.")
    }

    //coloca valores dentro do banco de dados
    const query = `INSERT INTO donors ("name", "email", "blood")VALUES ($1, $2, $3)`
    const values = [name, email, blood] 
    db.query(query, values, function (err) {
        if (err) return res.send("erro no banco de dados.")

        return res.redirect("/")
    })

})

server.listen(3000, function () {
    console.log("iniciei o servidor")
})

