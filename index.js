const { getAllFilePathsWithExtension, readFile } = require('./fileSystem');
const { readLine } = require('./console');
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
    const mainCommand = args[0];

    switch (mainCommand) {
        case 'exit':
            process.exit(0);
            break;
        case 'show':
            const allTodos1 = getAllTodos();
            allTodos1.forEach(todo => console.log(todo.raw));
            break;
        case 'important':
            const allTodos2 = getAllTodos();
            allTodos2
                .filter(todo => todo.importance > 0)
                .forEach(todo => console.log(todo.raw));
            break;
        case 'user':
            const userName = args[1]?.toLowerCase();
            if (!userName) {
                console.log('Имени нету');
                break;
            }
            const allTodos11 = getAllTodos();
            allTodos11
                .filter(todo => todo.user?.toLowerCase() === userName)
                .forEach(todo => console.log(todo.raw));
            break;
        case 'sort':
            const sortArg = args[1];
            if (!sortArg || !['importance', 'user', 'date'].includes(sortArg)) {
                console.log("Неверный аргумент для 'sort'. Используйте: sort {importance | user | date}");
                break;
            }
            const allTodos22 = getAllTodos();
            const sortedList = sortTodos(allTodos22, sortArg);
            sortedList.forEach(todoLine => console.log(todoLine));
            break;
        case 'date':
            const allTodos3 = getAllTodos();
            const ourDate = args[1];
            if (!ourDate) {
                console.log('Дата не указана');
                break;
            }
            getAllAfterDate(allTodos3, ourDate);
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
    let sorted;

    switch (type) {
        case 'importance':
            sorted = [...todos].sort((a, b) => b.importance - a.importance);
            break;

        case 'user':
            sorted = [...todos].sort((a, b) => {
                const userA = a.user;
                const userB = b.user;

                if (userA === null && userB === null) return 0;
                if (userA === null) return 1;
                if (userB === null) return -1;

                return userA.localeCompare(userB);
            });
            break;

        case 'date':
            sorted = [...todos].sort((a, b) => {
                const dateA = a.date;
                const dateB = b.date;

                if (!dateA && !dateB) return 0;
                if (!dateA) return 1;
                if (!dateB) return -1;

                return dateB.getTime() - dateA.getTime();
            });
            break;

        default:
            return todos;
    }

    return sorted.map(todo => todo.raw);
}