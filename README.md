# Tarea1

Para levantar las instacias se debe ejecutar el siguiente comando:
```
docker-compose up --build
```

Una vez inicializadas, se piden las peticiones a través del método POST
ejemplo:
```
http://localhost:3000/pag/search?q=maya
```

Para bajar las instacias se debe ejuctar el siguiente comando:
```
docker-compose down
```
Para eliminar el cache se ejecuta el siguiente comando:
```
docker system prune -a
```
