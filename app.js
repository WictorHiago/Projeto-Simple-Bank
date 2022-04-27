//modulos externos
const inquirer = require('inquirer')
const chalk = require('chalk')//usar versao 4.1.2

//modulos internos
const fs = require('fs')

operation()
function operation (){
    inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'O que você dejesa fazer?',
            choices: [
                'Criar conta',
                'Consultar Saldo',
                'Depositar',
                'Sacar',
                'Sair'
            ],
        },
    ])
    .then((answer)=> {
        const action = answer['action']
        
        if(action === 'Criar conta') {
            createAccount()
        }else if (action === 'Depositar') {
            deposit()
        }else if (action === 'Consultar Saldo') {
            getAccountBalance()
        }else if (action === 'Sacar') {
            withdraw()
        }else if (action === 'Sair') {
            console.log(chalk.bgBlue.black('Obrigado por usar o Simple Bank!'))
            process.exit()//para fechar
        }
    })
    .catch((err)=> console.log(err))
}
//create an account
function createAccount(){
    console.log(chalk.bgGreen.black('Parabens por escolher nosso banco!'))
    console.log(chalk.bgGreen.black('Defina as opções da sua conta a seguir'))
    
    buildAccount()
}

//constructor account
function buildAccount() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Digite um nome para a sua conta:'
        }
    ]).then(answer=> {
        const accountName = answer['accountName']

        console.info(accountName)

        if(!fs.existsSync('accounts')) {//verifica se existe este diretorio
            fs.mkdirSync('accounts')//se nao existe, cria um
        }

        if(fs.existsSync(`accounts/${accountName}.json`)) {
            console.log(chalk.bgRed.black('Esta conta já existe, escolha outra conta!'))
            buildAccount()
        }

        fs.writeFileSync(`accounts/${accountName}.json`, '{"balance": 0}',
        function(err) {//funcao anonima se tiver erro
            console.log(err)
        })

        console.log(chalk.green('Parabens, sua conta foi criada!'))
        
        operation()
    })
    .catch(err => console.log(err))
}

// add an R$ amount to user account
function deposit() {

    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta?'
        }
    ])
    .then((answer) =>{
        const accountName = answer['accountName']
        
        //verify if account exists
        if(!checkAccount(accountName)) {
            return deposit()
        }

        inquirer.prompt([
            {
                name: 'amount',
                message: 'Quanto você deseja depositar?'
            }
        ])
        .then((answer)=> {

            const amount = answer['amount']

            //add an amount
            addAmount(accountName,amount)

            operation()
        })

    })
    .catch(err=> {

        console.log(err)

    })
}

function checkAccount(accountName) {
    if(!fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(chalk.bgRed.black('Esta conta não existe, escolha outro nome!'))
        return false
    }

    return true
}

function addAmount(accountName, amount) {

    const accountData = getAccount(accountName)

    if(!amount) {
        console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente!'))
        return deposit()
    }

    accountData.balance = parseFloat(amount) + parseFloat(accountData.balance)

    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function (err) {
            console.log(err)
        },
    )

    console.log(chalk.green(`Foi depositado o valor de R$${amount} na sua conta!`)
    )
}

function getAccount(accountName) {
    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
        encoding: 'utf-8',
        flag: 'r'
    })
    return JSON.parse(accountJSON)
}
// show account balance
function getAccountBalance() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta?'
        }
    ]).then((answer) =>{
        const accountName = answer['accountName']

        //verufy if account exists
        if(!checkAccount(accountName)) {
            return getAccountBalance()
        }

        const accountData = getAccount(accountName)

        console.log(
            chalk.bgBlue.black(
            `Olá!, o saldo da sua conta é de R$${accountData.balance}`)
        ),
        operation()

    })
    .catch(err => console.log(err))
}

//withdraw an amount form user account
function withdraw() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome de usuario da sua conta?'
        }
    ])
    .then((answer)=> {
        const accountName = answer['accountName']

        if(!checkAccount(accountName)) {
            return withdraw()
        }
        
        inquirer.prompt([
            {
                name:'amount',
                message:'Quanto você deseja sacar?'
            }
        ])
        .then((answer) => {
            const amount = answer['amount']

            removeAmount(accountName, amount)
            //operation()
        })
        .catch(err => console.log(err))

    })
    .catch((err)=> console.log(err))
}

function removeAmount(accountName, amount) {

    const accountData = getAccount(accountName)

    if(!amount) {
        console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!'))
        return withdraw()
    }

    if( accountData.balance < amount) {
        console.log(chalk.bgRed.black('Valor indisponivel!'))
        return withdraw()
    }

    accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)

    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function(err) {
            console.log(err)
        }
    )

    console.log(chalk.green(`Foi realizado um saque de ${amount} na sua conta!`))
    operation()

}
