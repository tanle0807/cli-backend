#!/usr/bin/env node

const inquirer = require("inquirer");
const chalk = require("chalk");
const figlet = require("figlet");
const shell = require("shelljs");
const fs = require('fs')

const toCapitalize = (text) => {
    return text.charAt(0).toUpperCase() + text.substring(1)
}

const fromUpperCaseToCamelCase = (text) => {
    return text.charAt(0).toLowerCase() + text.substring(1)
}

const init = () => {
    console.log(
        chalk.green(
            figlet.textSync("MY CLI", {
                font: "Big",
                horizontalLayout: "default",
                verticalLayout: "default"
            })
        )
    );
}

const askQuestions = () => {
    const questions = [{
            type: "list",
            name: "MODULE",
            message: "CREATE MODULE?",
            choices: ["CONTROLLER", "CONTROLLER_RESOURCE", "ENTITY", "ENTITY_REQUEST", 'SERVICE', 'CONTROLLER + ENTITY + SERVICE']
        },
        {
            name: "FILENAME",
            type: "input",
            message: `INPUT NAME (EX: 'User', 'admin/Page',...)
-s ........... init CRUD controller
:`
        }
    ];
    return inquirer.prompt(questions);
};
const toCamelCase = str => {
    let s =
        str &&
        str
        .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
        .map(x => x.slice(0, 1).toUpperCase() + x.slice(1).toLowerCase())
        .join('');
    return s.slice(0, 1).toLowerCase() + s.slice(1);
};

const toKebabCase = str =>
    str &&
    str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    .map(x => x.toLowerCase())
    .join('-');

const toSnakeCase = str =>
    str &&
    str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    .map(x => x.toLowerCase())
    .join('_');

const replaceContent = (content, className, amountFolders, doc, folder) => {
    const out1Level = '/..'
    const path = '..' + out1Level.repeat(amountFolders)
    let [module, controller] = folder.split('/')
    // handle entityRequest
    const kebabCase = toKebabCase(className)
    const [first, second = null] = kebabCase.split('-')

    content = content.replace(/{{path}}/g, path);
    content = content.replace(/{{lower}}/g, className.toLowerCase());
    content = content.replace(/{{camel}}/g, toCamelCase(className));
    content = content.replace(/{{Cap}}/g, toCapitalize(className));
    content = content.replace(/{{snake}}/g, toSnakeCase(className));
    content = content.replace(/{{capEntity}}/g, toCapitalize(first));
    content = content.replace(/{{lowerEntity}}/g, first.toLowerCase());
    content = content.replace(/{{doc}}/g, doc);
    content = content.replace(/{{controller}}/g, `${module}/${fromUpperCaseToCamelCase(className)}`);
    return content
}

const createModule = (module, filename, folder, doc, amountFolders, drawFolder, className) => {
    shell.mkdir('-p', `${process.cwd()}/${folder}`)
    const filePath = `${process.cwd()}/${folder}/${toCapitalize(filename)}.ts`
    shell.touch(filePath);

    const origFilePath = `${__dirname}/template/${module}`;

    // get stats about the current file
    const stats = fs.statSync(origFilePath);

    if (stats.isFile()) {
        let contents = fs.readFileSync(origFilePath, 'utf8');
        contents = replaceContent(contents, className, amountFolders, doc, drawFolder, className)

        const writePath = `${filePath}`;
        fs.writeFileSync(writePath, contents, 'utf8');
    }
    // show success message
    success(filePath);
}

const createController = (filename, folder, doc, amountFolders, drawFolder, className) => {
    let module = 'CONTROLLER'
    filename = filename + 'Controller'
    folder = folder ? `src/controllers/${folder}` : 'src/controllers'
    createModule(module, filename, folder, doc, amountFolders, drawFolder, className)
}

const createControllerResource = (filename, folder, doc, amountFolders, drawFolder, className) => {
    let module = 'CONTROLLER_RESOURCE'
    filename = filename + 'Controller'
    folder = `src/controllers/${folder}`
    createModule(module, filename, folder, doc, amountFolders, drawFolder, className)
}

const createEntity = (filename, folder, doc, amountFolders, drawFolder, className) => {
    let module = 'ENTITY'
    folder = `src/entity`
    createModule(module, filename, folder, doc, amountFolders, drawFolder, className)
}

const createEntityRequest = (filename, folder, doc, amountFolders, drawFolder, className) => {
    let module = 'ENTITY_REQUEST'
    folder = `src/entity-request`
    createModule(module, filename, folder, doc, amountFolders, drawFolder, className)
}

const createService = (filename, folder, doc, amountFolders, drawFolder, className) => {
    let module = 'SERVICE'
    filename = filename + 'Service'
    folder = `src/services`
    createModule(module, filename, folder, doc, amountFolders, drawFolder, className)
}

const createFile = (module, filename) => {
    let folder = ''
    let drawFolder = ''
    let className = ''
    let amountFolders = 0
    let doc = ''
    let isResource = false

    if (filename.includes('-s') || filename.includes('-')) {
        const [name, ...flag] = filename.split(' ')
        isResource = true
        filename = name
    }

    if (filename.includes('/')) {
        const parts = filename.split('/')
        filename = parts[parts.length - 1]
        className = filename
        parts.pop()
        amountFolders = parts.length

        if (parts.length > 1) {
            folder = parts.join('/')
        } else {
            folder = parts[0]
        }
        drawFolder = folder + '/' + className.toLowerCase()
        doc = parts[0]
    } else {
        className = filename
    }

    switch (module) {
        case 'CONTROLLER':
            createController(filename, folder, doc, amountFolders, drawFolder, className)
            break;
        case 'CONTROLLER_RESOURCE':
            createControllerResource(filename, folder, doc, amountFolders, drawFolder, className)
            break;
        case 'ENTITY':
            createEntity(filename, folder, doc, amountFolders, drawFolder, className)
            break;
        case 'ENTITY_REQUEST':
            createEntityRequest(filename, folder, doc, amountFolders, drawFolder, className)
            break;
        case 'SERVICE':
            createService(filename, folder, doc, amountFolders, drawFolder, className)
            break;
        case 'CONTROLLER + ENTITY + SERVICE':
            if (isResource) {
                createControllerResource(filename, folder, doc, amountFolders, drawFolder, className)
            } else {
                createController(filename, folder, doc, amountFolders, drawFolder, className)
            }
            createEntity(filename, folder, doc, amountFolders, drawFolder, className)
            createService(filename, folder, doc, amountFolders, drawFolder, className)
        default:
            break;
    }

};

const success = (filepath) => {
    console.log(
        chalk.green.bold(`Done! File created at ${filepath}`)
    );
};

const run = async () => {
    // show script introduction
    init()
    // ask questions
    while (1) {
        const answers = await askQuestions();
        const {
            MODULE,
            FILENAME
        } = answers;
        // create the file
        const filePath = createFile(MODULE, FILENAME);

    }

};

run();