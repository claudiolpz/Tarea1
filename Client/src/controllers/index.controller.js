const grpc = require("@grpc/grpc-js");
const PROTO_PATH = "./src/controllers/pageSearch.proto"
var redis = require('redis')
var protoLoader = require("@grpc/proto-loader");


const options = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
};

// -------CONFIGURACION DE REDIS EN 3 CLIENTES-------



const redis_client1 = redis.createClient({
    url:"redis://redis1"
});

const redis_client2 = redis.createClient({
    url:"redis://redis2"
});

const redis_client3= redis.createClient({
    url:"redis://redis3"
});

redis_client1.on('ready',()=>{
    console.log("Redis1 listo")
    console.log("-------------------------------------------------------------------------------------------------------------")
})

redis_client2.on('ready',()=>{
    console.log("Redis2 listo")
    console.log("-------------------------------------------------------------------------------------------------------------")
})

redis_client3.on('ready',()=>{
    console.log("Redis3 listo")
    console.log("-------------------------------------------------------------------------------------------------------------")
})


redis_client1.connect()
redis_client2.connect()
redis_client3.connect()

console.log('Redis conection: '+redis_client1.isOpen);
console.log('Redis conection: '+redis_client2.isOpen);
console.log('Redis conection: '+redis_client3.isOpen);



var packageDefinition = protoLoader.loadSync(PROTO_PATH, options);

const PageSearch= grpc.loadPackageDefinition(packageDefinition).PageSearch;

const client = new PageSearch(
    "grpc_server:50051",
    grpc.credentials.createInsecure()
  );

const searchpag=(req,res)=>{
    const busqueda=req.query.q
    let cache = null;
    const start = new Date();

    (async () => {
            let reply1 = await redis_client1.get(busqueda);
            aux=0

            if(reply1 && aux==0){
                aux=1;
                cache = JSON.parse(reply1);
                console.log("Busqueda: "+busqueda)
                console.log("Encontrado en Caché! en redis 1")
                console.log("Resultados:")

                var string_total=""
                for (i in cache['pag']){
                var id=cache['pag'][i].id
                var title=cache['pag'][i].title
                var description=cache['pag'][i].description
                var url=cache['pag'][i].url
                
                const stringsumar='id: '+id+' | title:'+title+' | description:'+description+' | url:'+url
                string_total=string_total+stringsumar+'\n'
                }
                console.log(string_total)
                const end = new Date() - start;
                console.log("Tiempo "+end+" ms")
                
                

                console.log("-------------------------------------------------------------------------------------------------------------------------------")

                
                res.status(200).json(cache)
            }
            let reply2 = await redis_client2.get(busqueda);
            if(reply2 && aux==0){
                aux=1;
                cache = JSON.parse(reply2);
                console.log("Busqueda: "+busqueda)
                console.log("Encontrado en Caché! en redis 2")
                console.log("Resultados:")

                var string_total=""
                for (i in cache['pag']){
                var id=cache['pag'][i].id
                var title=cache['pag'][i].title
                var description=cache['pag'][i].description
                var url=cache['pag'][i].url
                
                const stringsumar='id: '+id+' | title:'+title+' | description:'+description+' | url:'+url
                string_total=string_total+stringsumar+'\n'
                }
                console.log(string_total)
                const end = new Date() - start;
                console.log("Tiempo "+end+" ms")
                
                

                console.log("-------------------------------------------------------------------------------------------------------------------------------")

                
                res.status(200).json(cache)
            }

            let reply3 = await redis_client3.get(busqueda);
            if(reply3 && aux==0){
                aux=1;
                cache = JSON.parse(reply3);
                console.log("Busqueda: "+busqueda)
                console.log("Encontrado en Caché! en redis 3")
                console.log("Resultados:")

                var string_total=""
                for (i in cache['pag']){
                var id=cache['pag'][i].id
                var title=cache['pag'][i].title
                var description=cache['pag'][i].description
                var url=cache['pag'][i].url
                
                const stringsumar='id: '+id+' | title:'+title+' | description:'+description+' | url:'+url
                string_total=string_total+stringsumar+'\n'
                }
                console.log(string_total)
                const end = new Date() - start;
                console.log("Tiempo "+end+" ms")
                
                

                console.log("-------------------------------------------------------------------------------------------------------------------------------")

                
                res.status(200).json(cache)
            }
        
        
            if(aux==0){
                
                
                console.log("Busqueda: "+busqueda)
                console.log("No se ha encontrado en Caché, Buscando en Postgres...")
                client.GetServerResponse({message:busqueda}, (error,t1) =>{
                    if(error){
                        
                        res.status(400).json(error);
                    }
                    else{

                        data = JSON.stringify(t1)

                        if (data['pag']!==null){
                        var array_of_functions= [
                            function() {redis_client1.set(busqueda,data)},
                            function() {redis_client2.set(busqueda,data)},
                            function() {redis_client3.set(busqueda,data)}
                        ]
                        const a= Math.floor(Math.random() * 3);
                        
                        
                        array_of_functions[a]();
                        const end = new Date() - start;
                        console.log("Tiempo "+end+" ms")
                
                        res.status(200).json(t1);}
                       


                        
            
                    }
                });
            } 
    })();

}




module.exports={
    searchpag
}
