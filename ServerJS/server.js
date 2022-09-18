const grpc = require("@grpc/grpc-js");
const PROTO_PATH = "./pageSearch.proto"
var protoLoader = require("@grpc/proto-loader");
const { client } = require("./src/dbconnector");

const options = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
};

var packageDefinition = protoLoader.loadSync(PROTO_PATH, options);
const a = grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();

server.addService(a.PageSearch.service, {
  GetServerResponse: (call, callback) => {
    const busqueda = call.request.message;

    client.connect((err, client, release) => {
      if (err) {
        return console.error('Error acquiring client', err.stack)
      }
      client.query(`select * from t1 where UPPER(title) like UPPER('%' || $1 || '%') or UPPER(url) like UPPER('%' || $1 || '%') or UPPER(description) like UPPER('%' || $1 || '%');`, [busqueda], (err, result) => {
        release()
        if (err) {
          return console.error('Error executing query', err.stack)
        }

        console.log("Resultados:")
        var string_total = ""
        for (i in result.rows) {
          var { id, title, description, url } = result.rows[i];
          var id = result.rows[i].id
          var title = result.rows[i].title
          var description = result.rows[i].description

          var url = result.rows[i].url
          const stringsumar = 'id: ' + id + ' | title:' + title + ' | description:' + description + ' | url:' + url 
          string_total = string_total + stringsumar + '\n'
        }
        if (string_total == "") {
          string_total = "No hay resultados..."
          callback(null, null);
        }
        else {
       
          callback(null, { pag: result.rows });
        }
        console.log(string_total)
  
        console.log("--------------------------------------------------------------------------------------------------------------------------------")


      })
    })
  },
});

server.bindAsync(
  "0.0.0.0:50051",
  grpc.ServerCredentials.createInsecure(),
  (error, port) => {
    console.log("Server running at http://127.0.0.1:50051");
    server.start();
  }
);