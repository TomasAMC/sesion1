//importar el paquete express
const express = require('express');
const app = express();

//urlencoded datos de formulario
app.use(express.urlencoded({extended:false}));
app.use(express.json());

//invocamos a dotenv
const dotenv = require('dotenv');
dotenv.config({path:'./env/.env'});

//directorio public
app.use('/resources',express.static('public'));
app.use('/resources',express.static(__dirname + '/public'));

//motor de plantillas ejs
app.set('view engine','ejs');

//invocamos a bcryptjs
const bcryptjs = require('bcryptjs');

//variables de sesion
const session = require('express-session');
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

//invocamos al modulo de conexcion de la base de datos
const connection = require('./database/db');
const { name } = require('ejs');

//establecimiento de las rutas

app.get('/login',(req, res)=>{
    res.render('login');
})

app.get('/register',(req, res)=>{
    res.render('register');
})

//registrar
app.post('/register', async (req, res)=>{
	const user = req.body.user;
	const name = req.body.name;
    const rol = req.body.rol;
	const pass = req.body.pass;
	let passwordHash = await bcryptjs.hash(pass, 8);
    connection.query('INSERT INTO users SET ?',{user:user, name:name, rol:rol, pass:passwordHash}, async (error, results)=>{
        if(error){
            console.log(error);
        }else{
            res.render('register',{
                alert: true,
                alertTitle: "registracion",
                alertMessage: "¡Successful Registration!",
                alertIcon: 'succeess',
                showConfirmButton: false,
                timer: 1500,
                ruta:''
            })
        }
    })
})  

//login auntentucacion
app.post('/auth', async(req, res)=>{
    const user = req.body.user;
    const pass = req.body.pass;
    let passwordHaash = await bcryptjs.hash(pass,8);
    if(user && pass){
        connection.query('SELECT * FROM users WHERE user = ?',[user], async(error, results)=>{
            if( results.length == 0 || !(await bcryptjs.compare(pass, results[0].pass)) ) {
                res.render('login',{
                    alert:true,
                    alertTitle:"Error",
                    alertMessage:"Usuario y password incorrectas",
                    alertIcon: "error",
                    showConfirmButton:true,
                    timer:false,
                    ruta:''
                }); 
            }else{
                    res.render('login',{
                    alert:true,
                        alertTitle:"Conexion exitosa",
                        alertMessage:"Login correcto",
                        alertIcon: "success",
                        showConfirmButton:false,
                        timer:1500,
                        ruta:''
                });
            }
        })
    }else{
        res.render('login',{
            alert:true,
                alertTitle:"Advertencia",
                alertMessage:"Porfavor ingrese el usuario y la contraseña",
                alertIcon: "warning",
                showConfirmButton:true,
                timer:1500,
                ruta:'login'
        });
    }        
})

app.listen(4000, (req, res)=>{ //puerto 
    console.log('SERVER RUNNING IN http://localhost:4000');
})