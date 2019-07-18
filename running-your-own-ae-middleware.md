# How to Run Your Own æternity Middleware

If you are following the developments around æternity’s SDK tools, you may have decided to run your own middleware to experiment and build on æternity’s platform. If it is still unclear how to get the middleware working for you, this blog post will help you. Below you will find two options for running your own middleware so you can successfully start building your first æpps.

## You will need

- Installation of Docker and Docker Compose
- Basic knowledge about Docker and Docker Compose
- Installation of Git(optional)
- A File Editor
- The Internet

## Option 1: Run the Middleware Without a Node (Roma)

Let’s suppose that you want to run your own æternity middleware based on the Roma release (Mainnet) without running your own æternity node. This option saves hard drive space, because you don’t need to have two copies of the same blockchain data on your machine.

Open your terminal and run these commands:

1. `git clone -b 'v0.2.0' --single-branch git@github.com:aeternity/aepp-middleware.git`
2. `cd aepp-middleware`
3. `docker-compose up -d`

Once the download and compilation is complete you can access the service on `localhost:80`

If you want to change the `default port(80)`, then just open the `docker-compose.yml` file and edit the `ports` section of the `middleware` under `services`.

### Changing the default port

Example: say you want the middleware service to be binded to port `8080` of your machine. 
To bind the service, simply change:

```yml
ports:
    - "80:80"
```

into

```yml
ports:
    - "8080:80"
```

## Option 2: Use Your Own æternity Node or a Remote One

For advanced users who are running their own local node or looking to connect to a different node or network (different from Roma), Option 2 is the way to go. It provides full control.
The three steps are the same as in Option 1. The only difference is in the editing you do **before** opening the terminal.

- open `docker-compose.yml`
- and edit the `EPOCH_URL` section of the `middleware` under `services`

Example: let’s say you want to connect the middleware to your own local node running on `localhost:3013`.
To do this, edit:

```yml
environment:
      - EPOCH_URL=https://roma-net.aepps.com
```

into

```yml
environment:
      - EPOCH_URL=http://localhost:3013
```


## Switching Networks

By design, all chain data is stored in a Postgres database connected to a docker volume.
There are two ways to switch networks.

### A. Edit the `docker-compose.yml`

If you don’t want to lose your `middleware` and `db` containers as well as the associated chain data, we recommend option A.

- `cd aepp-middleware`
- stop the running containers using `docker-compose stop`
- open `docker-compose.yml` and edit the `volumes` section

Then change:

```yml
volumes:
    ae-mdw-postgres-volume:
      external: false
```

into

```yml
volumes:
    local-ae-network:
      external: false
```

- Now re-start the containers using `docker-container up -d`

### B. Start from scratch

This should only be used if you want to completely remove previous network state and start with a clean database.

The below steps will remove the running `middleware` and `db` containers plus associated `volumes`

- `cd aepp-middleware`
- `docker-compose down -v`

This was a short introduction on how to run your own æternity middleware. There will definitely be more guides like this one in the near future as the middleware is being continuously developed. For now, all your questions, feedback and feature requests are very welcome on GitHub.

Let's build æternity together!
