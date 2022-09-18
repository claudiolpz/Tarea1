# Tarea1

Para levantar las instancias se debe ejecutar el siguiente comando:
```
docker-compose up --build
```

Una vez inicializadas, se piden las peticiones a través del método POST
ejemplo:
```
http://localhost:3000/pag/search?q=maya
```

Para bajar las instancias se debe ejecutar el siguiente comando:
```
docker-compose down
```
Para eliminar el caché se ejecuta el siguiente comando:
```
docker system prune -a
```
