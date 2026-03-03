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
        case 'date':
            const ourDate = args[1];
            if (!ourDate) {
                console.log('Дата не указана');
                break;
            }
            getAllAfterDate(ourDate);
            break;
        default:
            console.log('wrong command');
            break;
    }
}

function getAllAfterDate(ourDate) {
    const dateTodos = getAllTodos().filter(todo => {
        const parts = todo.replace('// TODO ', '').split(';');
        if (parts.length >= 3) {
            const todoDate = parts[1].trim();
            return todoDate >= ourDate;
        }
        return false;
    });
    dateTodos.forEach(t => console.log(t.trim()));
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

function processCommand(command) {
    const parts = command.trim().split(/\s+/);
    const mainCommand = parts[0];
    const arg = parts[1];

    try {
        switch (mainCommand) {
            case 'exit':
                process.exit(0);
                break;

            case 'show':
                getAllTodos().forEach(todo => console.log(todo.raw));
                break;

            case 'important':
                const importantTodos = getAllTodos().filter(todo => todo.importance > 0);
                importantTodos.forEach(todo => console.log(todo.raw));
                break;

            case 'user':
                const userName = arg?.toLowerCase();
                if (!userName) {
                    console.log('Имени нету. Используйте: user <имя>');
                    break;
                }
                const userTodos = getAllTodos().filter(todo =>
                    todo.user && todo.user.toLowerCase() === userName
                );
                userTodos.forEach(todo => console.log(todo.raw));
                break;

            case 'sort':
                if (!arg || !['importance', 'user', 'date'].includes(arg)) {
                    console.log("Неверный аргумент для 'sort'. Используйте: sort {importance | user | date}");
                    break;
                }

                const allTodos = getAllTodos();
                const sortedList = sortTodos(allTodos, arg);
                sortedList.forEach(todoLine => console.log(todoLine));
                break;

            default:
                console.log('wrong command');
                break;
        }
    } catch (e) {
        console.error("Произошла ошибка при выполнении команды:", e.message);
    }
}