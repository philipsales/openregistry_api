# PCARI API
* Version 1.0.0

### What is this repository for? ###

* Exclusive for PCARI UP-PGH and UP-D Institute of Biology members only

### Dependencies ###
this api uses a number of open source projects to work properly:

* [Nodejs] - a JavaScript runtime built on Chrome's V8 JavaScript engine. Node.js uses an event-driven, non-blocking I/O model that makes it lightweight and efficient. Node.js' package ecosystem, npm, is the largest ecosystem of open source libraries in the world.

* [Expressjs] - a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.

### How do I install it for production? ###
Please install the following sequentially:

    1. Installing Docker and Docker Compose
        1.1. Go to this link: https://docs.docker.com/engine/installation/linux/docker-ce/ubuntu/#os-requirements

        1.2. sudo apt-get install docker-compose
    2. Clone `biobankapi2` in your local machine
    * Clone `biobankapi2` using your terminal `https://<username>@bitbucket.org/tiusales_team/biobankapi2.git`
        ```
        git clone install https://<username>@bitbucket.org/tiusales_team/biobankapi2.git
        ```
    3. build `biobankapi2`:
        * biobankapi2
            ```
            cd biobankapi2
            
            docker-compose build
            ```

    4. Build and run mongodb:
        * mongodb
            ```
            cd biobankapi2
            
            docker-compose up -d authmongo
            ```

    5. Create mongo admin user
        * mongodb
            ```
            cd biobankapi2
            docker exec -it authmongo_me mongo admin
            # inside container mongo admin shell
            > db.createUser({ user: 'root', pwd: 'password', roles: [ { role: "root", db: "admin" } ] });
            > exit
            ```
    6. Run `biobankapi2` 
        * biobankapi2
            ```
            cd biobankapi2
            docker-compose up -d authapi
            ```
    6. add the seeds for `biobankapi2`
        * biobankapi2
            ```
            cd biobankapi2
            docker exec -it authapi_me bash
            # inside the container
            node server/server.js db:seed
            ```

### How to stop service in production? ###
Please do the following:

    1. go to `biobankapi2`
        ```
        cd biobankapi2
        docker-compose stop 
        ```

### How to clean up service with clean data? ###
Please do the following:

    1. stop running service
        ```
        cd biobankapi2
        docker-compose stop 
        ```

    2. remove containers
        ```
        cd biobankapi2
        docker-compose rm -v 
        ```
        
    3. remove data (optional)
        ```
        cd biobankapi2
        sudo rm -drf data
        ```
        
    4. remove images
        ```
        cd biobankapi2
        docker rmi biobankapi2_authapi
        docker rmi mongo:3.4.10 
        ```
        
### Contribution guidelines ###

* No direct push to major branches (master, develop) - all merge to master must pass through a pull request

### Who do I talk to? ###

* b.kristhian.tiu@gmail.com
* pjsales@ittc.up.edu.ph
* 
**Have fun CODING! TEAM!**
[//]: # (These are reference links used in the body of this note and get stripped out when the markdown processor does its job. There is no need to format nicely because it shouldn't be seen. Thanks SO - http://stackoverflow.com/questions/4823468/store-comments-in-markdown-syntax)

   [Nodejs]: <https://nodejs.org>
   [Expressjs]: <https://expressjs.com/>