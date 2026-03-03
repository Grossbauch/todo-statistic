const { getAllFilePathsWithExtension, readFile } = require('./fileSystem');
const { readLine } = require('./console');
const { printTable } = require('./formatter');

const files = getFiles();

console.log('Please, write your command!');
readLine(processCommand);

function getFiles() {
    const filePaths = getAllFilePathsWithExtension(process.cwd(), 'js');
    return filePaths.map(path => readFile(path));
}

function parseTodo(todoLine) {
    const raw = todoLine.trim();
    if (!raw.startsWith('// TODO')) {
        return null;
    }

    const importance = (raw.match(/!/g) || []).length;
    let content = raw.substring('// TODO'.length).trim();

    const cleanContent = content.replace(/!/g, '').trim();
    const parts = cleanContent.split(';');

    let user = null;
    let dateObj = null;
    let description = raw;

    if (parts.length > 0 && parts[0].trim() !== '') {
        user = parts[0].trim();

        if (parts.length > 1) {
            const secondPart = parts[1].trim();

            if (/^\d{4}-\d{2}-\d{2}$/.test(secondPart)) {
                dateObj = new Date(secondPart);
                if (isNaN(dateObj.getTime())) {
                    dateObj = null;
                    description = parts.slice(1).join(';').trim() || raw;
                    user = parts[0].trim();
                } else {
                    description = parts.slice(2).join(';').trim() || raw;
                }
            } else {
                description = parts.slice(1).join(';').trim() || raw;
                dateObj = null;
            }
        } else {
            if (raw.includes('!')) {
                description = raw;
                user = null;
            } else {
                description = parts[0].trim() || raw;
                user = null;
            }
        }

    } else {
        description = raw;
        user = null;
    }

    if (!description || description.length === 0) {
        description = raw;
    }

    return {
        raw,
        user: user || null,
        date: dateObj,
        importance: importance,
        description: description
    };
}

function processCommand(command) {
    const args = command.split(' ');
    const mainCommand = args[0]
    const allTodos = getAllTodos();

    switch (mainCommand) {
        case 'exit':
            process.exit(0);
            break;
        case 'show':
            printTable(allTodos);
            break;
        case 'important':
            printTable(allTodos.filter(todo => todo.importance > 0));
            break;
        case 'user':
            const userName = args[1]?.toLowerCase();
            if (!userName) {
                console.log('Имени нету');
                break;
            }
            printTable(allTodos.filter(todo => todo.user?.toLowerCase() === userName));
            break;
        case 'sort':
            const sortArg = args[1];
            if (!sortArg || !['importance', 'user', 'date'].includes(sortArg)) {
                console.log("Неверный аргумент для 'sort'.");
                break;
            }
            const sortedObjects = sortTodos(allTodos, sortArg);
            printTable(sortedObjects);
            break;
        case 'date':
            const ourDate = args[1];
            if (!ourDate) {
                console.log('Дата не указана');
                break;
            }
            const filteredByDate = allTodos.filter(todo => {
                const todoDateStr = todo.date ? todo.date.toISOString().split('T')[0] : '';
                return todoDateStr >= ourDate;
            });
            printTable(filteredByDate);
            break;
        default:
            console.log('wrong command');
            break;
    }
}

function getAllAfterDate(todos, ourDate) {
    const filtered = todos.filter(todo => {
        const parts = todo.raw.replace('// TODO ', '').split(';');
        if (parts.length >= 3) {
            const todoDateStr = parts[1].trim();
            return todoDateStr >= ourDate;
        }
        return false;
    });
    filtered.forEach(t => console.log(t.raw));
}

function getAllTodos() {
    const todos = [];
    files.forEach(fileContent => {
        const lines = fileContent.split('\n');
        lines.forEach(line => {
            const todoIndex = line.indexOf('// TODO');
            if (todoIndex !== -1) {
                const parsed = parseTodo(line.substring(todoIndex).trim());
                if (parsed) {
                    todos.push(parsed);
                }
            }
        });
    });
    return todos;
}

function sortTodos(todos, type) {
    let sorted = [...todos];

    switch (type) {
        case 'importance':
            sorted.sort((a, b) => b.importance - a.importance);
            break;
        case 'user':
            sorted.sort((a, b) => {
                const userA = (a.user || '{anonymous}').toLowerCase();
                const userB = (b.user || '{anonymous}').toLowerCase();
                return userA.localeCompare(userB);
            });
            break;
        case 'date':
            sorted.sort((a, b) => {
                if (!a.date) return 1;
                if (!b.date) return -1;
                return b.date - a.date;
            });
            break;
    }
    return sorted;
}