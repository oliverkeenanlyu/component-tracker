const fs = require('fs');
const readline = require('readline');

const COMPONENTS_FILE = 'stock.json';

// Load components from file
function loadComponents() {
  try {
    const data = fs.readFileSync(COMPONENTS_FILE);
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Save components to file
function saveComponents(components) {
  const data = JSON.stringify(components, null, 2);
  fs.writeFileSync(COMPONENTS_FILE, data);
}

// Add or update component stock
function updateComponentStock(name, operation, quantity) {
  const components = loadComponents();
  const index = components.findIndex((component) => component.name === name);

  if (index !== -1) {
    if (operation === 'add') {
      components[index].stock += quantity;
    } else if (operation === 'remove') {
      if (components[index].stock < quantity) {
        console.log(`Error: ${name} has ${components[index].stock} left. Cannot remove ${quantity}`);
        return;
      }
      components[index].stock -= quantity;
    }
  } else {
    if (operation === 'remove') {
      console.log(`Error: ${name} is not in stock.`);
      return;
    }
    components.push({ name, stock: quantity });
  }

  saveComponents(components);
  console.log(`Component ${name} stock ${operation === 'add' ? 'added' : operation === 'remove' ? 'removed' : null} by ${quantity}`);

}

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Recursive function to accept commands
function acceptCommand() {
  rl.question('→ Enter command (or type "exit" to quit): ', (command) => {
    if (command === 'exit') {
      rl.close();
      return;
    }

    const [arg1, arg2, ...nameArgs] = command.split(' ');

    if (arg1 === 'help') {
      displayHelp();
      acceptCommand();
      return;
    }

    if (arg1 === 'stock') {
      displayStock();
      acceptCommand();
      return;
    }

    if (arg1 === 'find') {

      const [arg1, ...nameArgsFind] = command.split(' ');

      const name = nameArgsFind.join(' ').toUpperCase();

      if (!name) {
        console.log('Invalid command. Please provide an item name to search.');
        acceptCommand();
        return;
      }

      findStock(name);
      acceptCommand();
      return;
    }

    if (arg1 === 'clear') {
      clearTerminal();
      acceptCommand();
      return;
    }

    if (arg1 === 'format') {
      formatStock();
      acceptCommand();
      return;
    }


    if (arg1 && arg2 && nameArgs.length > 0) {
      const operation = arg1;
      const quantity = parseInt(arg2);
      const name = nameArgs.join(' ').toUpperCase();

      if (isNaN(quantity)) {
        console.log('Invalid quantity. Please provide a valid number.');
        acceptCommand();
        return;
      }

      if (operation !== 'add' && operation !== 'remove') {
        console.log('Invalid operation. Please provide "add" or "remove".');
        acceptCommand();
        return;
      }

      updateComponentStock(name, operation, quantity);
    } else {
      console.log('Invalid command. Please provide an operation, quantity, and name.');
    }

    acceptCommand();
  });
}


// Display welcome message with instructions
console.log("Welcome to the component stock management system! type 'help' to view commands\n");


// Start accepting commands
acceptCommand();

// Display help information
function displayHelp() {
  console.log('\n\nAvailable commands:');
  console.log('add <quantity> <name>    - Add components to stock');
  console.log('remove <quantity> <name> - Remove components from stock');
  console.log('find <name>              - Find an item');
  console.log('stock                     - Display all stock');
  console.log('format                   - Deletes all components with 0 stock');
  console.log('help                     - Display this help information');
  console.log('clear                    - Clears the terminal display');
  console.log('exit                     - Exit the program\n\n');
}

function displayStock() {

  const stockList = loadComponents();

  if (stockList.length === 0) {
    console.log('\n---------------\n')
    console.log('\nThere are no items in stock\n')
    console.log('Results: 0\n')
  } else {
    console.log('\n---------------\n')

    for (const item of stockList) {
      console.log(`Item: ${item.name} - Qty: ${item.stock}`)
    }
    console.log(`\nResults: ${stockList.length}\n`)

  }

}

function findStock(query) {
  const stockList = loadComponents();

  if (stockList.length === 0) {
    console.log('\nThere are no items in stock\n');
  } else {
    const searchWords = query.toLowerCase().split(' ');

    const items = stockList.filter((component) => {
      const componentName = component.name.toLowerCase();
      return searchWords.every((word) => componentName.includes(word));
    });

    if (items.length === 0) {
      console.log('\n---------------\n');
      console.log('Results: 0\n');
    } else {
      console.log('\n---------------\n');
      for (const filteredItem of items) {
        console.log(`Item: ${filteredItem.name} - Qty: ${filteredItem.stock}`);
      }
      console.log(`\nResults: ${items.length}\n`);
    }
  }
}


function clearTerminal() {
  console.clear();
  console.log("Welcome to the component stock management system! type 'help' to view commands\n");
}

function formatStock() {

  const stockList = loadComponents();

  if (stockList.length === 0) {
    console.log('\nThere are no items format\n')
  } else {

    let formattedItems = []
    let originalItems = []

    for (let i = 0; i < stockList.length; i++) {
      if (stockList[i].stock === 0) {
        formattedItems.push(stockList[i])
        stockList.splice(i, 1)
      } else {originalItems.push(stockList[i])}
    }

    if (formattedItems.length === 0) {
      console.log('\n---------------\n')
      console.log(`No items were deleted\n`)

    } else {
      saveComponents(originalItems);
      console.log('\n---------------\n')
      for (const item of formattedItems) {
        console.log(`Item: ${item.name} - Qty: ${item.stock}`)
      }
      console.log(`\nDeleted: ${formattedItems.length}\n`)
    }




  }

}


