const express = require("express");
const app = express();
const { Controller } = require("./Controller");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const { S3Client, GetObjectAclCommand, GetObjectCommand, ListObjectsCommand } = require('@aws-sdk/client-s3');
const multerS3 = require('multer-s3');
const shortId = require('shortid');
const fileUdpload = require("express-fileupload")
const { PutObjectCommand } = require("@aws-sdk/client-s3")
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const fs = require("fs")
const { v4: uuidv4 } = require('uuid');

//app.use(fileUdpload())

app.use(cors());

app.use(bodyParser.json());




/* autenticación */
app.post("/auth", function(req, res) {
        const people = req.body;
        Controller.getAuth(people, res);
    })
    /* autenticación */

/* -------------------------course petitions------------------------- */
//create 
app.post("/courses", function(req, res) {
    const course = req.body;
    Controller.setCourse(course, res);
})


//show 
app.get("/courses", (req, res) => {
    Controller.getCourses(res);
})

//show for id
app.get("/courses/:id", (req, res) => {
    const id = req.params;
    Controller.getCourse(id, res);
})

//update 
app.put("/courses/:id", (req, res) => {
    const course = req.body.courses;
    course.id = req.params.id;
    Controller.updateCourse(course, res);
});

//delete 
app.delete("/courses/:id", (req, res) => {
    const id = req.params.id;
    Controller.deleteCourse(id, res);
})

/* /-------------------------course petitions------------------------- */


/* /-------------------------people petitions------------------------- */

app.post("/peoples", function(req, res) {
    const people = req.body;
    Controller.setPeople(people, res);
})

app.get("/peoples", function(req, res) {
    Controller.getPeoples(res);
})

app.get("/peoples/:id", function(req, res) {
    const id = req.params;
    console.log(id)
    Controller.getPeople(id, res);
})

app.put("/peoples/:id", function(req, res) {
    const people = req.body.peoples;
    people.id = req.params.id;
    Controller.updatePeople(people, res);
});

app.delete("/peoples/:id", function(req, res) {
        const id = req.params.id;
        Controller.deletePeople(id, res);
    })
    /* /-------------------------role petitions------------------------- */



/*
Roles------------------------------------------------------ 
*/
app.post("/roles", function(req, res) {
    const role = req.body;
    Controller.setRole(role, res);
})

app.get("/roles", function(req, res) {
    Controller.getRoles(res);
});

app.put("/roles/:id", function(req, res) {
    const role = req.body.roles;
    role.id = req.params.id;
    Controller.updateRole(role, res);
});

app.delete("/roles/:id", function(req, res) {
    const id = req.params.id;
    Controller.deleteRole(id, res);
});

/* /-------------------------role petitions------------------------- */
/* Comando para cargar archivo a AWS */
const s3 = new S3Client({
    region: 'us-east-1',
    credentials: {
        accessKeyId: 'AKIATM4RK4AY26ERNHF4',
        secretAccessKey: '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',
    },
    sslEnabled: false,
    s3ForcePathStyle: true,
    signatureVersion: 'v4',
});


var upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'trackapp3',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        metadata: function(req, file, cb) {
            // console.log(file)
            cb(null, { fieldName: file.fieldname });
        },
        key: function(req, file, cb) {
            // cb(null, Date.now().toString())
            cb(null, shortId.generate() + '-' + file.originalname);
        }
    })
})


async function getFiles() {
    const command = new ListObjectsCommand({
        Bucket: 'trackapp3',
    })
    return await s3.send(command)

}
async function getFile(fileName) {
    const command = new GetObjectCommand({
        Bucket: 'trackapp3',
        Key: fileName
    })
    return await s3.send(command)

}
async function getFileURL(fileName) {
    const command = new GetObjectCommand({
        Bucket: 'trackapp3',
        Key: fileName
    })
    return await getSignedUrl(s3, command, { expiresIn: 3600 })

}


//create

app.get('/files', async(req, res) => {
    const result = await getFiles()
    res.json(result.Contents)
})

app.get('/files/:fileName', async(req, res) => {
    const result = await getFile(req.params.fileName)
    res.json(result.$metadata)
})
app.get('/file/:fileName', async(req, res) => {
    const result = await getFileURL(req.params.fileName)
    res.json({
        url: result
    })
})

/* -------------------------exercise petitions------------------------- */
app.post("/exer", upload.single('file'), function(req, res) {
    const archivo = req.file;
    res.send({ status: 200, nU: archivo });
})
app.post("/exercisesss", function(req, res) {
    const exercise = req.body;
    Controller.setExerciseEstudiante(exercise, res);
})

app.post("/exercises", function(req, res) {
    const exercise = req.body;
    Controller.setExercise(exercise, res);
})


app.post("/exercisescalificar", function(req, res) {
    const paq = req.body;
    Controller.setCalificacionExcersice(paq, res);
})

//show
app.get("/exercises", (req, res) => {
    Controller.getExercises(res);
})

//show for id
app.get("/exercises/:id", (req, res) => {
    let { id } = req.params;
    Controller.getExercise(id, res);
})

//get exercises docente

app.get("/exercisesdocente/:id", (req, res) => {
    const { id } = req.params;
    console.log(id)
    Controller.getExerciseDocente(id, res);
})


//update
app.put("/exercises/:id", (req, res) => {
    const exercise = req.body.exercises;
    exercise.id = req.params.id;
    Controller.updateExercise(exercise, res);
});

//delete
app.delete("/exercises/:id", (req, res) => {
    const id = req.params.id;
    Controller.deleteExercise(id, res);
})

/* /-------------------------exercise petitions------------------------- */

/* -------------------------area petitions------------------------- */
//create
app.post("/areas", function(req, res) {
    const area = req.body;
    Controller.setArea(area, res);
})

//show
app.get("/areas", (req, res) => {
    Controller.getAreas(res);
})

//show for id
app.get("/areas/:id", (req, res) => {
        let { id } = req.params;
        Controller.getAreas(id, res);
    })
    //update
app.put("/areas/:id", (req, res) => {
    const area = req.body.areas;
    area.id = req.params.id;
    Controller.updateArea(area, res);
});

//delete
app.delete("/areas/:id", (req, res) => {
    const id = req.params.id;
    Controller.deleteArea(id, res);
})

/* /-------------------------area petitions------------------------- */

/* -------------------------school petitions------------------------- */
//create
app.post("/schools", function(req, res) {
    const school = req.body;
    Controller.setSchool(school, res);
})

//show
app.get("/schools", (req, res) => {
    Controller.getSchools(res);
})

//show for id
app.get("/schools/:id", (req, res) => {
        let { id } = req.params;
        Controller.getPeriods(id, res);
    })
    //update
app.put("/schools/:id", (req, res) => {
    const school = req.body.schools;
    school.id = req.params.id;
    Controller.updateSchool(school, res);
});

//delete
app.delete("/schools/:id", (req, res) => {
    const id = req.params.id;
    Controller.deleteSchool(id, res);
})

/* /-------------------------school petitions------------------------- */

/* -------------------------exerciseType petitions------------------------- */
//create
app.post("/exercisetypes", function(req, res) {
    const exercisetype = req.body;
    Controller.setExerciseType(exercisetype, res);
})

//show
app.get("/exercisetypes", (req, res) => {
    Controller.getExerciseTypes(res);
})

//show for id
app.get("/exercisetypes/:id", (req, res) => {
        let { id } = req.params;
        Controller.getExerciseType(id, res);
    })
    //update
app.put("/exercisetypes/:id", (req, res) => {
    const exercisetype = req.body.exerciseTypes;
    exercisetype.id = req.params.id;
    Controller.updateExerciseType(exercisetype, res);
});

//delete
app.delete("/exercisetypes/:id", (req, res) => {
    const id = req.params.id;
    Controller.deleteExerciseType(id, res);
})

/* /-------------------------exerciseType petitions------------------------- */

/* -------------------------resource petitions------------------------- */
//create
app.post("/resources", function(req, res) {
    const resource = req.body;
    Controller.setResource(resource, res);
})

//show
app.get("/resources", (req, res) => {
    Controller.getResources(res);
})

//show for id
app.get("/resources/:id", (req, res) => {
        let { id } = req.params;
        Controller.getResource(id, res);
    })
    //update
app.put("/resources/:id", (req, res) => {
    const resource = req.body.resources;
    resource.id = req.params.id;
    Controller.updateResource(resource, res);
});

//delete
app.delete("/resources/:id", (req, res) => {
    const id = req.params.id;
    Controller.deleteResource(id, res);
})

/* /-------------------------resource petitions------------------------- */

/* -------------------------resource petitions------------------------- */
//create
app.post("/sendExercises", function(req, res) {
    const sendExercise = req.body;
    Controller.setSendExercise(sendExercise, res);
})

//show
app.get("/sendExercises", (req, res) => {
    Controller.getSendExercises(res);
})

//show for id
app.get("/sendExercises/:id", (req, res) => {
        let { id } = req.params;
        Controller.getResource(id, res);
    })
    //update
app.put("/sendExercises/:id", (req, res) => {
    const sendExercise = req.body.sendExercises;
    sendExercise.id = req.params.id;
    Controller.updateSendExercise(sendExercise, res);
});

//delete
app.delete("/sendExercises/:id", (req, res) => {
    const id = req.params.id;
    Controller.deleteSendExercise(id, res);
})



/* /-------------------------resource petitions------------------------- */


/* Estudiante curso */

app.post("/getEstuActivi", (req, res) => {
    const { id } = req.body;
    Controller.getActividadEstudent(id, res);

})

/* ----------------------*/
app.get("/gabriel/:id", (req, res) => {
    const { id } = req.params;
    Controller.getGabriel(id, res);
})
exports.app = app;

//////// Aqui queda lo de micro clase //////////
///////////////////////////////////////////////
app.post("/microClase", function(req, res) {
    const micro = req.body;
    Controller.setMicroClase(micro, res);
})

app.post("/microClasepdf", upload.single('file'), function(req, res) {
    const archivo = req.file;
    res.send({ status: 200, nU: archivo });
})


const stor = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './bin/H5P/')
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname)
    }

});

//var upload = multer({ storage: storage });
const cargar = multer({ stor: stor });
app.post("/microClaseh5p", cargar.single('file'), (req, res) => {
    const micro = req.file;

    // res.send({ status: 200, nU: micro });
    const fs = require('fs');
    const AdmZip = require('adm-zip');
    const crypto = require('crypto');

    //Ruta local de archivo que se va a descomprimir, necesita estár en la carpeta de origen deeste código
    //const file = './Prueba.zip';
    const file = micro
        // elimina la extensión .zip del nombre del archivo
    var folderName = file.originalname.slice(0, -4);
    folderName += crypto.randomUUID();
    // console.log(folderName)
    const puto = {
        url: `./bin/H5P/${folderName}`,
        nombre: file.originalname
    }
    res.send({ status: 200, nU: puto });
    //creamos un condicional para validar el tipo de archivo y proceder extraer el .zip usando metodo zip.extractAllTo
    if (file.mimetype.endsWith('application/octet-stream')) {
        //crea la carpeta utilizando el método fs.mkdirSync() de la biblioteca fs
        fs.mkdirSync(`./bin/H5P/${folderName}`);
        const zip = new AdmZip(file.buffer);
        zip.extractAllTo(`./bin/H5P/${folderName}`);
        const puto = {
            url: `./bin/H5P/${folderName}`,
            nombre: folderName
        }
        console.log(puto)
            //  res.send({ status: 200, nU: puto });
        console.log('Archivo descomprimido');
    } else {
        res.send({ status: 500, nU: 'Formato no soportado' });
    }

    // Controller.setMicroClase(micro, res);
})



app.post("/asignaturasMicroClase", function(req, res) {
    const curso = req.body;
    Controller.setAsignaturaMicroClase(curso, res);
})


const client = new S3Client({
    region: 'us-east-2',
    credentials: {
        accessKeyId: 'AKIAYLRQH66MCDN3CT3O',
        secretAccessKey: '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',
    },
})

async function uploadfile(file) {
    let idUnico = uuidv4();
    const nombre = file.name + idUnico + '.h5p'
    const uploadParams = {
        Bucket: 'microclasestrackapp',
        Key: nombre,
        Body: file.data
    }
    const command = new PutObjectCommand(uploadParams)
    let x = await client.send(command)
    x.nombre = nombre
    return x

}
async function getFileURLh5p(fileName) {
    const command = new GetObjectCommand({
        Bucket: 'microclasestrackapp',
        Key: fileName
    })
    return await getSignedUrl(client, command, { expiresIn: 3600 })

}
app.use(fileUdpload())
app.post("/microclaseS3H5p", async function(req, res) {

    const nombre = req.files.file.name
    const archivo = await uploadfile(req.files.file)
    const url = await getFileURLh5p(archivo.nombre)
    res.send({ status: 200, nU: url, nombre: nombre });


})

///////// hasta aqui esta micro clase ////////
/////////////////////////////////////////////



// Ruta para manejar la solicitud POST del archivo ZIP
/*app.post("/microClaseh5p", cargar.array('files'), (req, res) => {
    console.log('Llegó'); // Información del archivo subido
    // Procesar el archivo ZIP
    res.send("Archivo recibido");
});

//_____________________________________*/