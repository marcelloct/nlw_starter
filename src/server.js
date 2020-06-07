const express = require("express")
const server = express()

// pegar o banco de dados
const db = require("./database/db.js")

// configurar pasta pública
server.use(express.static("public"))

// habilitar o uso do req.body na nossa aplicação
server.use(express.urlencoded({ extended: true }))

// configurar caminhos da minha aplicação
// página inicial
// req: REquisição
// res: REsposta
server.get("/", (req, res) =>{
    return res.render("index.html")
})

server.get("/create-point", (req, res) =>{

    // req.query: Query Strings da nossa url
    //console.log(req.query)

    return res.render("create-point.html")
})

server.post("/savepoint", (req, res)=> {

    // req.body: o corpo do nosso formulário
    //console.log(req.body)

    //inserir dados no banco de dados
    const query = `
    INSERT INTO places (
        image,
        name,
        address,
        address2,
        state,
        city,
        items
    ) VALUES (?,?,?,?,?,?,?);
    `

    const values = [
       req.body.image,
       req.body.name,
       req.body.address,
       req.body.address2,
       req.body.state,
       req.body.city,
       req.body.items

    ]

    function afterInsertData(err){
        if(err){
            console.log(err)
            return res.send("Erro ao cadastrar!")
        }

        console.log("Cadastrado com Sucesso")
        console.log(this)

        return res.render("create-point.html", { saved: true}) // exibe a mensagem de sucesso na própria página
    }

    db.run(query, values, afterInsertData)

    
})

server.get("/search", (req, res) =>{

    const search = req.query.search
    if(search == "") {
        // pesquisa vazia
        return res.render("search-results.html", {total : 0})
    }

    // pegar os dados do banco de dados
    // db.all(`SELECT * FROM places WHERE city = '${search}'`, function(err,rows){ // Pesquisa deve ser feita exatamente igual ao nome cadastrado para retorno
    db.all(`SELECT * FROM places WHERE city LIKE '%${search}%'`, function(err,rows){ // Pesquisa pode ser parcialmente semelhante ao nome cadastrado
        if(err){
            return console.log(err)
        }
        //console.log(rows)
        
        const total = rows.length

        // mostrar a página html com os dados do banco de dados
        return res.render("search-results.html", {places : rows, total : total})
    })

    
})



//ligar o servidor
server.listen(3000) // porta do localhost

// utilizando template engine
const nunjucks = require("nunjucks")
nunjucks.configure("src/views", {
    express: server,
    noCache: true
})