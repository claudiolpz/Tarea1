from ssl import ALERT_DESCRIPTION_ACCESS_DENIED
from time import time
from unicodedata import name
import requests
from bs4 import BeautifulSoup
import threading

lock=threading.Lock()
# ------------------- READ_TXT ------------------- #
def xd(path,max_lines=None):
    outputFile = open('/home/claudio/Escritorio/respaldo/neww/Tarea1/Crawler/urls.txt', "w") 
  
    inputFile = open(path, "r") 
    
    lines_seen_so_far = set() 
    
    for line in inputFile: 

    
        tab = line.split('\t')
        #print(tab)
        # ------------------Evitamos las url en blanco. Es \n porque es el ultimo termino antes de un salto de linea.------------------ #
        if tab[4] == '\n':
            continue
        url = tab[4]
        #print(url)
        # ------------------Evitamos el salto de linea.------------------ #
        c_url = url[:-1]
    
    
        if c_url not in lines_seen_so_far: 
            outputFile.write(c_url+"\n") 
            lines_seen_so_far.add(c_url)         
    
    inputFile.close() 
    outputFile.close() 

def read_csv(path,max_lines=None):
    
    with open(path, 'r') as f:
        fichero = open("/home/claudio/Escritorio/respaldo/neww/Tarea1/Database/db/init.sql/init.sql", 'w')
        primeralinea="CREATE TABLE T1(Id INT GENERATED ALWAYS AS IDENTITY, title VARCHAR(100), description VARCHAR(400), keywords text[], URL VARCHAR(100), PRIMARY KEY(URL));\n"
        fichero.write(primeralinea)
        fichero.close()
        cont = 0
        cont22=0

        lines = f.readlines()[1:]
        contador=0
        hilos=[]
        for line in lines:
            cont22+=1
            print(cont22)
            if (cont == max_lines):
                return
            tab = line.split('\t')
            #print(tab)
            # ------------------Evitamos las url en blanco. Es \n porque es el ultimo termino antes de un salto de linea.------------------ #
            if tab[0] == '\n':
                continue
            url = tab[0]
            #print(url)
            # ------------------Evitamos el salto de linea.------------------ #
            c_url = url[:-1]
            #print(c_url)
            
            temp = threading.Thread(target=getDataFromUrl, args=(c_url,)) 
            hilos.append(temp)
            contador += 1
            temp.start()
           
            if contador ==3000000:
                
                
                for i in hilos:
                    print("ttt "+i)
                    i.join()
                    print("a")
                contador = 0
                hilos.clear()
                
      
            #getDataFromUrl(c_url);
            
    
                
    return 


# ------------------- SCRAPING ------------------- #
def getDataFromUrl(url):
    print(threading.active_count())
    
   
    collected_data = {'url': url, 'title': None, 'description': None, 'keywords': None}
    try:
        r = requests.get(url,timeout=0.7)
    except Exception:

        return None

    if r.status_code == 200:    

        # Se puede usar BeautifulSoap u otra libreria que parsee la metadata de los docuementos HTML.
        source = requests.get(url).text
        soup = BeautifulSoup(source, features='html.parser')

        try:
            if soup.title is None:
                title =''
            else:
                title = soup.title.string

            # Obtenemos la descripcion
            description = soup.find("meta", {'name': "description"})
            description = description['content'] if description else None
            if description is None:
                description =""
            if(len(description)>400):
                description=description[0:300]+"..."
            # Obtenemos la keywords y las limpiamos
            keywords = soup.find("meta", {'name': "keywords"})
            keywords = keywords['content'] if keywords else None
            
            try:
                if keywords is None:
                    keywords =['']
                else:
                    keywords = keywords.replace(" ", "") if keywords else None
                    keywords = keywords.replace(".", "") if keywords else None
                    keywords = keywords.replace("'", '"') if keywords else None
                    keywords = keywords.split(",") if keywords else None  
                                     
            except Exception:
                return None
            if title is None:
                collected_data['title'] = ""
            else:
                collected_data['title'] = title
                collected_data['title']=repr(collected_data["title"]).replace("'", '"')
            
            lock.acquire()
            
            fichero = open("/home/claudio/Escritorio/respaldo/neww/Tarea1/Database/db/init.sql/init.sql", 'a+')
            collected_data['description'] = description
            collected_data['description']=repr(collected_data["description"]).replace("'", '"')
            collected_data['keywords'] = keywords
            
            lineaxd="insert into T1(title, description,keywords,url) values ("+repr(collected_data["title"])+", "+repr(collected_data["description"])+", ARRAY "+repr(collected_data['keywords'])+",'"+url+"') ON CONFLICT DO NOTHING;\n"
           
            fichero.write(lineaxd)
            fichero.close()
            
            #print(lineaxd)
            lock.release()
            
            return None
        except Exception:
            return None
    else:
        return None
    


# ------------------- MAIN ------------------- #
if __name__ == '__main__':
    path = '/home/claudio/Escritorio/respaldo/neww/Tarea1/Crawler/user-ct-test-collection-04.txt'
    xd(path)

    path2 = '/home/claudio/Escritorio/respaldo/neww/Tarea1/Crawler/urls.txt'
    read_csv(path2)
    
    #print("xddddddd")

    
    # url = 'http://www.wilmap.com.au'
    # getDataFromUrl(url)
    # #print(data)