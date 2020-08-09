import express from 'express'; 
import routes from './routes';
import cors from 'cors'

const app = express();

app.use(express.json());
app.use(cors());
app.use(routes)


app.listen(3333);


// Knex = escrever sql em javascript

//ver funcionalidades primeiro
// www.blablabla.com.br:porta 
//localhost:3333/...
// conceito de rotas 
// recurso 
// método http 

// get: Buscar ou listar informação
// put: atualizar informação
// post: criar informação
// delete: deletar informação
// corpo (Request Body): Dados para criação ou atualização de um registro
//navegador requisita get por padrão 
//Route params: identificar qual recurso eu quero atualizar ou deletar
//Query Params: Paginação, listagem, filtros