const {getAllFilePathsWithExtension, readFile} = require('./fileSystem');
const {readLine} = require('./console');

const files = getFiles();

console.log('Please, write your command!');
readLine(processCommand);

function getFiles() {
    const filePaths = getAllFilePathsWithExtension(process.cwd(), 'js');
    return filePaths.map(path => readFile(path));
}

function processCommand(command) {
    const args = command.split(' ');
    const mainCommand = args[0];

    switch (mainCommand) {
        case 'exit':
            process.exit(0);
            break;
        case 'show':
            const allTodos = getAllTodos();
            allTodos.forEach(todo => console.log(todo));
            break;
        case 'important':
            const importantTodos = getAllTodos().filter(todo => todo.includes('!'));
            importantTodos.forEach(todo => console.log(todo));
            break;
        case 'user':
            const userName = args[1]?.toLowerCase();
            if (!userName) {
                console.log('Имени нету');
                break;
            }
            const userTodos = getAllTodos().filter(todo => {
                const parts = todo.replace('// TODO ', '').split(';');
                if (parts.length >= 3) {
                    return parts[0].trim().toLowerCase() === userName;
                }
                return false;
            });
            userTodos.forEach(todo => console.log(todo));
            break;
        default:
            console.log('wrong command');
            break;
    }
}

function show() {
    const paths = getAllFilePathsWithExtension();
    console.log(paths);
}

function getAllTodos() {
    const todos = [];
    files.forEach(fileContent => {
        const lines = fileContent.split('\n');
        lines.forEach(line => {
            const todoIndex = line.indexOf('// TODO');
            if (todoIndex !== -1) {
                todos.push(line.substring(todoIndex).trim());
            }
        });
    });
    return todos;
}
