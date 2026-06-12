const fs = require('fs');

const path = 'src/data/exercises.ts';
let code = fs.readFileSync(path, 'utf8');

// Replace the bank account description
code = code.replace(
  /description:\s*"Implement a BankAccount class[^"]+",/g,
  "description: `### Implement a BankAccount Class\n\nYou are tasked with modeling a simple \\`BankAccount\\` in C++.\n\n**Core Requirements:**\n1. **State:** Keep track of a private \\`double balance\\` and \\`std::string owner\\`.\n2. **Deposit:** The \\`deposit(double amount)\\` method should add the specified amount to the balance, but **ignore negative amounts** entirely.\n3. **Withdraw:** The \\`withdraw(double amount)\\` method must subtract the amount *only* if the account holds sufficient funds. If the withdrawal is successful, return \\`true\\`; otherwise, return \\`false\\` and leave the balance unchanged.\n4. **Display:** Implement a \\`print()\\` method that outputs the account details exactly like this:\n   \\`Account[owner]: $balance\\`\n   Ensure the balance is printed with exactly **2 decimal places** (e.g., \\`Account[Alice]: $120.00\\`).\n\n*Hint: Use \\`<iomanip>\\` for formatting.*`,"
);

// Replace Student Grade Manager
code = code.replace(
  /description:\s*"Build a Student class[^"]+",/g,
  "description: `### Student Grade Manager\n\nBuild a robust \\`Student\\` class that manages an arbitrary number of grades using **dynamic memory allocation**.\n\n**Requirements:**\n- Store the student's name (\\`std::string\\`) and a dynamic array of \\`double\\` grades.\n- **addGrade()**: Appends a grade to the array. If the array is full, you must allocate a new, larger array on the heap and copy over the old elements.\n- **getAverage()**: Returns the arithmetic mean of all grades. If no grades exist, return \\`0.0\\`.\n- **printSorted()**: Prints each grade on its own line in **ascending order**. *Critical:* This must not modify the internal array's order!\n- **Rule of Three**: You must implement a deep-copy copy constructor to prevent double-free errors.`,"
);

// Replace Dynamic Matrix
code = code.replace(
  /description:\s*"Implement a Matrix class[^"]+",/g,
  "description: `### Dynamic Matrix\n\nImplement a \\`Matrix\\` class that represents a 2D grid of numbers (size \\`n \\times m\\`), backed by a **flat, 1D array** on the heap.\n\n**Key Objectives:**\n1. Use a single \\`double* data\\` pointer to store elements. You will calculate the 1D index using \\`row * cols + col\\`.\n2. Implement \\`operator()(int row, int col)\\` to provide read/write access to elements.\n3. Implement a \\`print()\\` method that prints the matrix row by row, with elements separated by spaces.\n4. Carefully implement the destructor, copy constructor, and copy assignment operator to manage memory perfectly and handle self-assignment gracefully.`,"
);

fs.writeFileSync(path, code);
console.log("Updated exercises.ts");
