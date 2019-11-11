// my-generator/my-action/index.js
module.exports = {
    prompt: ({
        inquirer
    }) => {
        return inquirer.prompt({
            type: 'select',
            choices: [{
                name: 'Fun'
            }],
            name: 'typeInject',
            message: "You want to inject?"
        })
    }
    // prompter
    // .prompt({
    //     type: 'select',
    //     choices: ['1', '2', '3'],
    //     name: 'name',
    //     message: "What's your email?"
    // })
    // .then(({
    //     email
    // }) => {
    //     prompter.prompt({
    //         type: 'input',
    //         name: 'emailConfirmation',
    //         message: `Please type your email [${email}] again:`
    //     })
    // })
}