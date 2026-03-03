const MAX_WIDTHS = {
    importance: 1,
    user: 10,
    date: 10,
    description: 50
};

function formatCell(text, targetWidth, maxWidth) {
    let result = text || '';
    if (result.length > maxWidth) {
        result = result.substring(0, maxWidth - 3) + '...';
    }
    return result.padEnd(targetWidth);
}

function calculateWidths(todos) {
    const headers = { user: 'user', date: 'date', description: 'comment' };
    const getVal = (todo, field) => {
        if (field === 'date') return todo.date ? todo.date.toISOString().split('T')[0] : '';
        return String(todo[field] || '');
    };

    const widths = {
        importance: 1,
        user: headers.user.length,
        date: headers.date.length,
        description: headers.description.length
    };

    todos.forEach(todo => {
        widths.user = Math.max(widths.user, (todo.user || '').length);
        widths.date = Math.max(widths.date, todo.date ? 10 : 0);
        widths.description = Math.max(widths.description, (todo.description || '').length);
    });

    return {
        importance: Math.min(widths.importance, MAX_WIDTHS.importance),
        user: Math.min(widths.user, MAX_WIDTHS.user),
        date: Math.min(widths.date, MAX_WIDTHS.date),
        description: Math.min(widths.description, MAX_WIDTHS.description)
    };
}

function printTable(todos) {
    const widths = calculateWidths(todos);

    const formatRow = (importance, user, date, description) => {
        const c1 = formatCell(importance, widths.importance, MAX_WIDTHS.importance);
        const c2 = formatCell(user, widths.user, MAX_WIDTHS.user);
        const c3 = formatCell(date, widths.date, MAX_WIDTHS.date);
        const c4 = formatCell(description, widths.description, MAX_WIDTHS.description);
        return `  ${c1}  |  ${c2}  |  ${c3}  |  ${c4}`;
    };

    const header = formatRow('!', 'user', 'date', 'comment');
    const separator = '-'.repeat(header.length);

    console.log(header);
    console.log(separator);

    todos.forEach(todo => {
        const imp = todo.importance > 0 ? '!' : '';
        const dateStr = todo.date ? todo.date.toISOString().split('T')[0] : '';
        console.log(formatRow(imp, todo.user, dateStr, todo.description));
    });

    if (todos.length > 0) {
        console.log(separator);
    }
}

module.exports = { printTable };