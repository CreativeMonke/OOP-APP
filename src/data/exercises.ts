import type { Exercise } from "@/types";

export const EXERCISE_CATEGORIES = [
  "Basic Class Structure",
  "Static Methods & Overloading",
  "Constructors",
  "Operator Overloading",
  "Copy & Move Semantics",
  "Inheritance & Abstract Classes",
  "Polymorphism",
  "Templates",
  "STL Usage",
  "Exceptions",
  "User-Defined Literals",
  "Design Patterns",
] as const;

export const EXERCISES: Exercise[] = [
  // ─── CATEGORY 1: Basic Class Structure ───────────────────────────────────────

  {
    id: "01-bank-account",
    categoryIndex: 0,
    difficulty: "beginner",
    title: "BankAccount",
    description: `### Implement a BankAccount Class\n\nYou are tasked with modeling a simple \`BankAccount\` in C++.\n\n**Core Requirements:**\n1. **State:** Keep track of a private \`double balance\` and \`std::string owner\`.\n2. **Deposit:** The \`deposit(double amount)\` method should add the specified amount to the balance, but **ignore negative amounts** entirely.\n3. **Withdraw:** The \`withdraw(double amount)\` method must subtract the amount *only* if the account holds sufficient funds. If the withdrawal is successful, return \`true\`; otherwise, return \`false\` and leave the balance unchanged.\n4. **Display:** Implement a \`print()\` method that outputs the account details exactly like this:\n   \`Account[owner]: $balance\`\n   Ensure the balance is printed with exactly **2 decimal places** (e.g., \`Account[Alice]: $120.00\`).\n\n*Hint: Use \`<iomanip>\` for formatting.*`,
    hints: [
      "Use std::fixed and std::setprecision(2) for the balance display.",
      "In withdraw(), compare amount against balance before subtracting.",
    ],
    starterCode: `#include <iostream>
#include <iomanip>
#include <string>
using namespace std;

class BankAccount {
private:
    string owner;
    double balance;
public:
    BankAccount(const string& owner, double initialBalance = 0.0);
    void deposit(double amount);
    bool withdraw(double amount);
    double getBalance() const;
    string getOwner() const;
    void print() const;
};

// TODO: Implement the constructor
// - Initialize owner and balance from parameters

// TODO: Implement deposit()
// - Add amount to balance only if amount > 0

// TODO: Implement withdraw()
// - Subtract amount if balance >= amount, return true
// - Otherwise return false and leave balance unchanged

// TODO: Implement getBalance() and getOwner()

// TODO: Implement print()
// - Output: "Account[Alice]: $120.00"
`,
    testHarness: `int main() {
    int failed = 0;
    auto CHECK = [&](bool cond, const string& name) {
        cout << (cond ? "PASS" : "FAIL") << ": " << name << "\\n";
        if (!cond) failed++;
    };

    BankAccount acc("Alice", 100.0);
    acc.deposit(50.0);
    CHECK(acc.getBalance() == 150.0, "deposit increases balance");

    bool ok = acc.withdraw(30.0);
    CHECK(ok && acc.getBalance() == 120.0, "withdraw succeeds with funds");

    bool bad = acc.withdraw(500.0);
    CHECK(!bad && acc.getBalance() == 120.0, "withdraw fails on overdraft");

    acc.deposit(-10.0);
    CHECK(acc.getBalance() == 120.0, "negative deposit is ignored");

    CHECK(acc.getOwner() == "Alice", "getOwner returns correct name");

    if (failed == 0) cout << "ALL TESTS PASSED\\n";
    return failed;
}`,
  },

  {
    id: "01-student",
    categoryIndex: 0,
    difficulty: "intermediate",
    title: "Student Grade Manager",
    description: `### Student Grade Manager\n\nBuild a robust \`Student\` class that manages an arbitrary number of grades using **dynamic memory allocation**.\n\n**Requirements:**\n- Store the student's name (\`std::string\`) and a dynamic array of \`double\` grades.\n- **addGrade()**: Appends a grade to the array. If the array is full, you must allocate a new, larger array on the heap and copy over the old elements.\n- **getAverage()**: Returns the arithmetic mean of all grades. If no grades exist, return \`0.0\`.\n- **printSorted()**: Prints each grade on its own line in **ascending order**. *Critical:* This must not modify the internal array's order!\n- **Rule of Three**: You must implement a deep-copy copy constructor to prevent double-free errors.`,
    hints: [
      "Allocate grades on the heap with 'new double[capacity]', expand when needed.",
      "For printSorted(), copy the array into a local buffer and sort only that.",
    ],
    starterCode: `#include <iostream>
#include <algorithm>
#include <string>
using namespace std;

class Student {
private:
    string name;
    double* grades;
    int count;
    int capacity;
public:
    explicit Student(const string& name);
    Student(const Student& other);          // deep copy
    Student& operator=(const Student& other);
    ~Student();

    void addGrade(double grade);
    double getAverage() const;
    void printSorted() const;
    int getCount() const { return count; }
    const string& getName() const { return name; }
};

// TODO: Implement all methods
// - Constructor: allocate initial capacity of 4
// - Copy constructor: copy all grades into new allocation
// - addGrade: append; double capacity if full
// - getAverage: sum / count, return 0.0 if count == 0
// - printSorted: print sorted grades (do not modify internal array)
// - Destructor: delete[] grades
`,
    testHarness: `int main() {
    int failed = 0;
    auto CHECK = [&](bool cond, const string& name) {
        cout << (cond ? "PASS" : "FAIL") << ": " << name << "\\n";
        if (!cond) failed++;
    };

    Student s("Bob");
    s.addGrade(85.0);
    s.addGrade(92.0);
    s.addGrade(78.0);

    CHECK(s.getCount() == 3, "count is 3 after 3 addGrades");
    double avg = s.getAverage();
    CHECK(avg > 84.9 && avg < 85.1, "average is 85.0");

    Student s2(s);
    s2.addGrade(100.0);
    CHECK(s.getCount() == 3, "copy is independent (original unchanged)");
    CHECK(s2.getCount() == 4, "copy got extra grade");

    // printSorted outputs in ascending order
    cout << "Sorted grades for Bob:\\n";
    s.printSorted(); // should print: 78 85 92

    if (failed == 0) cout << "ALL TESTS PASSED\\n";
    return failed;
}`,
  },

  {
    id: "01-matrix",
    categoryIndex: 0,
    difficulty: "advanced",
    title: "Dynamic Matrix",
    description: `### Dynamic Matrix\n\nImplement a \`Matrix\` class that represents a 2D grid of numbers (size \`n \\times m\`), backed by a **flat, 1D array** on the heap.\n\n**Key Objectives:**\n1. Use a single \`double* data\` pointer to store elements. You will calculate the 1D index using \`row * cols + col\`.\n2. Implement \`operator()(int row, int col)\` to provide read/write access to elements.\n3. Implement a \`print()\` method that prints the matrix row by row, with elements separated by spaces.\n4. Carefully implement the destructor, copy constructor, and copy assignment operator to manage memory perfectly and handle self-assignment gracefully.`,
    hints: [
      "Store data as a single 'double* data' array of size rows*cols.",
      "operator()(r,c) returns data[r*cols + c] by reference.",
      "Copy assignment must handle self-assignment and free old memory first.",
    ],
    starterCode: `#include <iostream>
#include <iomanip>
using namespace std;

class Matrix {
private:
    double* data;
    int rows, cols;
public:
    Matrix(int rows, int cols, double fill = 0.0);
    Matrix(const Matrix& other);
    Matrix& operator=(const Matrix& other);
    ~Matrix();

    double& operator()(int row, int col);
    double  operator()(int row, int col) const;
    int getRows() const { return rows; }
    int getCols() const { return cols; }
    void print() const;
};

// TODO: Implement all methods.
// - Constructor: allocate rows*cols doubles, fill all with 'fill'
// - Copy constructor: allocate new memory, copy elements
// - operator= : free old, allocate new, copy (handle self-assignment!)
// - Destructor: delete[] data
// - operator(): return reference to data[row*cols + col]
// - print(): for each row print cols values separated by spaces, newline at end
`,
    testHarness: `int main() {
    int failed = 0;
    auto CHECK = [&](bool cond, const string& name) {
        cout << (cond ? "PASS" : "FAIL") << ": " << name << "\\n";
        if (!cond) failed++;
    };

    Matrix m(2, 3);
    m(0,0) = 1; m(0,1) = 2; m(0,2) = 3;
    m(1,0) = 4; m(1,1) = 5; m(1,2) = 6;
    CHECK(m(1,2) == 6.0, "element access");

    Matrix m2(m);
    m2(0,0) = 99;
    CHECK(m(0,0) == 1.0, "copy is deep — original unchanged");

    Matrix m3(1, 1);
    m3 = m;
    CHECK(m3(1,1) == 5.0, "assignment copies values");
    m3 = m3; // self-assignment must not crash
    CHECK(m3(1,1) == 5.0, "self-assignment safe");

    cout << "Matrix:\\n";
    m.print(); // 1 2 3 / 4 5 6

    if (failed == 0) cout << "ALL TESTS PASSED\\n";
    return failed;
}`,
  },

  // ─── CATEGORY 2: Static Methods & Overloading ────────────────────────────────

  {
    id: "02-counter",
    categoryIndex: 1,
    difficulty: "beginner",
    title: "Instance Counter",
    description: `### Instance Counter with Static Members\n\nDesign a \`Counter\` class that demonstrates two core OOP concepts: **static class members** and **method chaining**.\n\n**Requirements:**\n1. A \`static int instanceCount\` tracks how many \`Counter\` objects currently exist in memory.\n2. The **constructor** increments this count; the **destructor** decrements it.\n3. \`static int getCount()\` returns the current instance count.\n4. \`increment(int by=1)\` and \`decrement(int by=1)\` modify the object's own \`value\` field.\n5. Both return \`*this\` (a reference to the current object), enabling **chained calls** like \`c.increment(5).increment(3)\`.\n\n*Remember:* define the static member **outside** the class body.`,
    hints: [
      "Declare 'static int instanceCount;' inside the class and define it in the implementation.",
      "Return Counter& from increment/decrement to enable chaining: c.increment().increment().",
    ],
    starterCode: `#include <iostream>
using namespace std;

class Counter {
private:
    static int instanceCount;
    int value;
public:
    explicit Counter(int startValue = 0);
    ~Counter();
    Counter& increment(int by = 1);
    Counter& decrement(int by = 1);
    int getValue() const { return value; }
    static int getCount();
};

// Define the static member (outside the class)
// int Counter::instanceCount = 0;

// TODO: Implement constructor (increment instanceCount)
// TODO: Implement destructor (decrement instanceCount)
// TODO: Implement increment/decrement (return *this)
// TODO: Implement static getCount()
`,
    testHarness: `int main() {
    int failed = 0;
    auto CHECK = [&](bool cond, const string& name) {
        cout << (cond ? "PASS" : "FAIL") << ": " << name << "\\n";
        if (!cond) failed++;
    };

    CHECK(Counter::getCount() == 0, "initial instance count is 0");
    {
        Counter a(10), b(20);
        CHECK(Counter::getCount() == 2, "two instances in scope");
        a.increment(5).increment(3);
        CHECK(a.getValue() == 18, "chained increment");
        b.decrement(7);
        CHECK(b.getValue() == 13, "decrement");
    }
    CHECK(Counter::getCount() == 0, "count returns to 0 after scope");

    if (failed == 0) cout << "ALL TESTS PASSED\\n";
    return failed;
}`,
  },

  {
    id: "02-calculator",
    categoryIndex: 1,
    difficulty: "intermediate",
    title: "Overloaded Calculator",
    description: `### Overloaded Calculator\n\nExplore **function overloading** and **static methods** by building a Calculator.\n\n**Methods to implement:**\n- \`add(int, int) → int\` — integer addition\n- \`add(double, double) → double\` — floating-point addition\n- \`add(const string&, const string&) → string\` — string concatenation\n- \`static multiply(double, double)\` — multiplication without needing an instance\n- \`static power(double base, int exp)\` — compute \`base^exp\` **iteratively** (do NOT use \`<cmath>\`)\n\n**Key Concept:** C++ resolves which \`add()\` to call based on argument types at compile time. All three can coexist with the same name.`,
    hints: [
      "Overloaded functions must differ in parameter types, not return type alone.",
      "String concatenation with operator+ works on std::string automatically.",
    ],
    starterCode: `#include <iostream>
#include <string>
using namespace std;

class Calculator {
public:
    int    add(int a, int b) const;
    double add(double a, double b) const;
    string add(const string& a, const string& b) const;
    static double multiply(double a, double b);
    static double power(double base, int exp);   // base^exp, exp >= 0
};

// TODO: Implement all methods.
// - power(): compute base^exp iteratively (do not use <cmath>)
`,
    testHarness: `int main() {
    int failed = 0;
    auto CHECK = [&](bool cond, const string& name) {
        cout << (cond ? "PASS" : "FAIL") << ": " << name << "\\n";
        if (!cond) failed++;
    };

    Calculator calc;
    CHECK(calc.add(3, 4) == 7, "int add");
    CHECK(calc.add(1.5, 2.5) == 4.0, "double add");
    CHECK(calc.add(string("hello "), string("world")) == "hello world", "string concat");
    CHECK(Calculator::multiply(3.0, 4.5) == 13.5, "static multiply");
    CHECK(Calculator::power(2.0, 10) == 1024.0, "power 2^10");
    CHECK(Calculator::power(5.0, 0)  == 1.0,    "power x^0 == 1");

    if (failed == 0) cout << "ALL TESTS PASSED\\n";
    return failed;
}`,
  },

  {
    id: "02-logger",
    categoryIndex: 1,
    difficulty: "advanced",
    title: "Singleton Logger",
    description: `### Singleton Logger — Meyer's Pattern\n\nImplement a thread-safe Singleton Logger using **Meyer's Singleton** pattern.\n\n**Requirements:**\n1. \`static Logger& getInstance()\` returns a single, lazily-initialized instance using a static local variable.\n2. \`log(const string&)\` appends a message to an internal \`vector<string>\`.\n3. \`logf(const char* fmt, ...)\` uses C-style variadic arguments (\`va_list\`, \`vsnprintf\`) for printf-style formatting, then internally calls \`log()\`.\n4. \`getMessages()\` returns a \`const vector<string>&\` of all logged messages.\n5. \`clear()\` empties the log.\n6. The **copy constructor** and **assignment operator** must be \`= delete\` to prevent cloning the singleton.\n\n*Hint: Use \`<cstdarg>\` for the variadic implementation.*`,
    hints: [
      "Meyer's singleton: 'static Logger& getInstance() { static Logger inst; return inst; }'",
      "Use <cstdarg>: va_list args; va_start(args, fmt); vsnprintf(buf, size, fmt, args); va_end(args);",
    ],
    starterCode: `#include <iostream>
#include <string>
#include <vector>
#include <cstdarg>
#include <cstdio>
using namespace std;

class Logger {
private:
    vector<string> messages;
    Logger() = default;
public:
    Logger(const Logger&) = delete;
    Logger& operator=(const Logger&) = delete;

    static Logger& getInstance();
    void log(const string& msg);
    void logf(const char* fmt, ...);
    const vector<string>& getMessages() const;
    void clear();
};

// TODO: Implement getInstance() as Meyer's singleton
// TODO: Implement log() — append msg to messages
// TODO: Implement logf() — format with vsnprintf into a char buffer, then log()
// TODO: Implement getMessages() and clear()
`,
    testHarness: `int main() {
    int failed = 0;
    auto CHECK = [&](bool cond, const string& name) {
        cout << (cond ? "PASS" : "FAIL") << ": " << name << "\\n";
        if (!cond) failed++;
    };

    Logger& L = Logger::getInstance();
    Logger& L2 = Logger::getInstance();
    CHECK(&L == &L2, "singleton: same address");

    L.clear();
    L.log("hello");
    L.logf("value is %d and %s", 42, "world");
    CHECK(L.getMessages().size() == 2, "two messages logged");
    CHECK(L.getMessages()[0] == "hello", "first message");
    CHECK(L.getMessages()[1].find("42") != string::npos, "logf formats number");
    CHECK(L.getMessages()[1].find("world") != string::npos, "logf formats string");

    if (failed == 0) cout << "ALL TESTS PASSED\\n";
    return failed;
}`,
  },

  // ─── CATEGORY 3: Constructors ────────────────────────────────────────────────

  {
    id: "03-point",
    categoryIndex: 2,
    difficulty: "beginner",
    title: "Point with Multiple Constructors",
    description: `### Point with Multiple Constructors\n\nLearn constructor overloading by building a 2D \`Point\` class.\n\n**You must provide three constructors:**\n1. **Default** \`Point()\` — initializes to \`(0, 0)\`\n2. **Parameterized** \`Point(double x, double y)\`\n3. **Copy** \`Point(const Point& other)\` — creates an independent clone\n\n**Other methods:**\n- Getters and setters for \`x\` and \`y\`\n- \`distanceTo(const Point&)\` — Euclidean distance via Pythagorean theorem: \u221a((x₂-x₁)² + (y₂-y₁)²)\n- \`print()\` — outputs \`(x, y)\` to \`cout\`\n\n*Use \`<cmath>\` for \`std::sqrt\`.*`,
    hints: [
      "Use <cmath> for std::sqrt.",
      "The copy constructor signature is: Point(const Point& other).",
    ],
    starterCode: `#include <iostream>
#include <cmath>
using namespace std;

class Point {
private:
    double x, y;
public:
    Point();                          // default: (0,0)
    Point(double x, double y);       // parameterized
    Point(const Point& other);       // copy

    double getX() const;
    double getY() const;
    void setX(double x);
    void setY(double y);
    double distanceTo(const Point& other) const;
    void print() const;              // prints "(x, y)"
};

// TODO: Implement all methods
`,
    testHarness: `int main() {
    int failed = 0;
    auto CHECK = [&](bool cond, const string& name) {
        cout << (cond ? "PASS" : "FAIL") << ": " << name << "\\n";
        if (!cond) failed++;
    };

    Point p1;
    CHECK(p1.getX() == 0.0 && p1.getY() == 0.0, "default constructor (0,0)");

    Point p2(3.0, 4.0);
    CHECK(p2.getX() == 3.0 && p2.getY() == 4.0, "parameterized constructor");

    Point p3(p2);
    p3.setX(10.0);
    CHECK(p2.getX() == 3.0, "copy is independent");

    double dist = p1.distanceTo(p2);
    CHECK(dist > 4.99 && dist < 5.01, "distance (3,4) from origin is 5");

    p2.print(); // Expected: (3, 4)

    if (failed == 0) cout << "ALL TESTS PASSED\\n";
    return failed;
}`,
  },

  {
    id: "03-mystring",
    categoryIndex: 2,
    difficulty: "intermediate",
    title: "MyString — Manual String Class",
    description: `### MyString — Manual String Class\n\nBuild your own string class from scratch to master **heap memory management** and the **Rule of Three**.\n\n**Internal state:** A \`char*\` pointer and an \`int len\`.\n\n**Constructors:**\n- Default → empty string (\`data\` points to a single \`'\\0'\`)\n- From C-string → \`new char[len+1]\` + \`strcpy\`\n- Copy constructor → **deep copy** (never copy the pointer itself!)\n\n**Methods:**\n- \`length()\` → returns \`strlen\`\n- \`c_str()\` → returns the raw \`const char*\`\n- \`append(const MyString&)\` → concatenates two strings (allocate new buffer, copy both, free old)\n- \`operator=\` → must handle **self-assignment** gracefully\n- **Destructor** → \`delete[]\` the buffer\n\n*Warning: every \`new[]\` must have a matching \`delete[]\`!*`,
    hints: [
      "Use new char[len+1] and strcpy to copy strings.",
      "In the copy constructor and operator=, always allocate fresh memory — never copy the pointer.",
      "operator= must handle self-assignment: if (this == &other) return *this;",
    ],
    starterCode: `#include <iostream>
#include <cstring>
using namespace std;

class MyString {
private:
    char* data;
    int len;
public:
    MyString();                            // empty string
    explicit MyString(const char* s);     // from C string
    MyString(const MyString& other);      // deep copy
    MyString& operator=(const MyString& other);
    ~MyString();

    int length() const;
    const char* c_str() const;
    void append(const MyString& other);
    void print() const;
};

// TODO: Implement all methods.
// Remember: always allocate new memory in copy constructor and operator=
`,
    testHarness: `int main() {
    int failed = 0;
    auto CHECK = [&](bool cond, const string& name) {
        cout << (cond ? "PASS" : "FAIL") << ": " << name << "\\n";
        if (!cond) failed++;
    };

    MyString s1;
    CHECK(s1.length() == 0, "default is empty");

    MyString s2("hello");
    CHECK(s2.length() == 5, "length of 'hello'");

    MyString s3(s2);
    // Modify s3 raw memory to verify deep copy
    char* p = const_cast<char*>(s3.c_str());
    p[0] = 'X';
    CHECK(s2.c_str()[0] == 'h', "copy is deep — s2 unchanged after s3 modified");

    MyString s4("world");
    s2.append(s4);
    CHECK(s2.length() == 10, "append length");
    CHECK(strcmp(s2.c_str(), "helloworld") == 0, "append content");

    MyString s5;
    s5 = s2;
    s5 = s5; // self-assignment must not crash
    CHECK(strcmp(s5.c_str(), "helloworld") == 0, "assignment works");

    if (failed == 0) cout << "ALL TESTS PASSED\\n";
    return failed;
}`,
  },

  {
    id: "03-buffer",
    categoryIndex: 2,
    difficulty: "advanced",
    title: "Buffer — Rule of Five",
    description: `### Buffer — Rule of Five

Implement a Buffer class (for bytes or template Buffer<T>) that fully implements the **Rule of Five** to manage a dynamic heap-allocated resource.

**Requirements:**
- **Allocation:** The constructor allocates an array of \`n\` bytes on the heap.
- **Deep Copy:** Implement the copy constructor and copy assignment operator to perform deep copies.
- **Move Semantics:** Implement the move constructor and move assignment operator (using std::swap or stealing pointers) to transfer ownership.
- **State Guarantee:** After a move operation, the source buffer must be left in a clean empty state, returning \`size() == 0\` and \`data() == nullptr\`.`,
    hints: [
      "Move constructor: this->data = other.data; other.data = nullptr; other.sz = 0;",
      "Move assignment: std::swap(this->data, other.data); std::swap(this->sz, other.sz); — then the destructor of other cleans up the old data.",
    ],
    starterCode: `#include <iostream>
#include <cstring>
#include <utility>
using namespace std;

class Buffer {
private:
    unsigned char* data_;
    size_t sz;
public:
    explicit Buffer(size_t n, unsigned char fill = 0);
    Buffer(const Buffer& other);               // deep copy
    Buffer(Buffer&& other) noexcept;           // steal
    Buffer& operator=(const Buffer& other);   // copy assign
    Buffer& operator=(Buffer&& other) noexcept; // move assign
    ~Buffer();

    size_t size() const;
    unsigned char* data();
    const unsigned char* data() const;
    bool isEmpty() const;
};

// TODO: Implement all five special members and the accessors.
// After a move, the moved-from object must have data()==nullptr and size()==0.
`,
    testHarness: `int main() {
    int failed = 0;
    auto CHECK = [&](bool cond, const string& name) {
        cout << (cond ? "PASS" : "FAIL") << ": " << name << "\\n";
        if (!cond) failed++;
    };

    Buffer b1(8, 0xAB);
    CHECK(b1.size() == 8, "constructed size");
    CHECK(b1.data()[0] == 0xAB, "fill value");

    Buffer b2(b1);                     // copy
    b2.data()[0] = 0xFF;
    CHECK(b1.data()[0] == 0xAB, "copy is deep");

    Buffer b3(move(b1));               // move construct
    CHECK(b3.size() == 8, "move target has data");
    CHECK(b1.isEmpty(), "move source is empty");
    CHECK(b1.data() == nullptr, "move source data is null");

    Buffer b4(4, 0x00);
    b4 = move(b3);                     // move assign
    CHECK(b4.size() == 8, "move-assigned target has 8 bytes");
    CHECK(b3.isEmpty(), "move-assign source is empty");

    if (failed == 0) cout << "ALL TESTS PASSED\\n";
    return failed;
}`,
  },

  // ─── CATEGORY 4: Operator Overloading ────────────────────────────────────────

  {
    id: "04-vector2d",
    categoryIndex: 3,
    difficulty: "beginner",
    title: "Vector2D Operators",
    description: `### Vector2D Operators

Create a Vector2D class that represents a 2D coordinate vector and overloads common arithmetic and relational operators.

**Requirements:**
- **State:** Stores double \`x\` and \`y\`.
- **Operators:**
  - Binary \`+\` for vector addition.
  - Unary \`-\` to negate the vector.
  - Scalar multiplication \`*\` (implement both \`v * k\` and \`k * v\` using friend functions).
  - Comparison operators \`==\` and \`!=\`.
  - Output stream operator \`<<\`.
- **Method:** Implement \`length()\` returning the Euclidean norm using \`std::sqrt\`.`,
    hints: [
      "Friend function for k*v: friend Vector2D operator*(double k, const Vector2D& v);",
      "operator== compares x and y with a small epsilon for floating-point safety.",
    ],
    starterCode: `#include <iostream>
#include <cmath>
using namespace std;

class Vector2D {
public:
    double x, y;
    Vector2D(double x = 0, double y = 0) : x(x), y(y) {}

    Vector2D operator+(const Vector2D& other) const;
    Vector2D operator-() const;                      // unary negate
    Vector2D operator*(double k) const;              // v * k
    friend Vector2D operator*(double k, const Vector2D& v); // k * v
    bool operator==(const Vector2D& other) const;
    bool operator!=(const Vector2D& other) const;
    friend ostream& operator<<(ostream& os, const Vector2D& v);
    double length() const;
};

// TODO: Implement all operators.
// For ==, two doubles are equal if |a-b| < 1e-9
`,
    testHarness: `int main() {
    int failed = 0;
    auto EQ = [](double a, double b) { return fabs(a-b) < 1e-9; };
    auto CHECK = [&](bool cond, const string& name) {
        cout << (cond ? "PASS" : "FAIL") << ": " << name << "\\n";
        if (!cond) failed++;
    };

    Vector2D a(3, 4), b(1, 2);
    auto c = a + b;
    CHECK(EQ(c.x, 4) && EQ(c.y, 6), "addition");

    auto neg = -a;
    CHECK(EQ(neg.x, -3) && EQ(neg.y, -4), "unary negate");

    auto scaled = a * 2.0;
    CHECK(EQ(scaled.x, 6) && EQ(scaled.y, 8), "v * k");

    auto scaled2 = 2.0 * a;
    CHECK(EQ(scaled2.x, 6) && EQ(scaled2.y, 8), "k * v");

    CHECK(a == Vector2D(3, 4), "equality true");
    CHECK(a != b, "inequality");
    CHECK(EQ(a.length(), 5.0), "length of (3,4) is 5");

    cout << "v = " << a << "\\n"; // Expected: (3, 4)

    if (failed == 0) cout << "ALL TESTS PASSED\\n";
    return failed;
}`,
  },

  {
    id: "04-intstack",
    categoryIndex: 3,
    difficulty: "intermediate",
    title: "Stack with Custom Operators",
    description: `### Stack with Custom Operators

Build an IntStack class that demonstrates custom operator overloading for stack structures.

**Requirements:**
- **Operators:**
  - \`operator+=(int)\` to push a value onto the stack.
  - \`operator[](int)\` for element index access (index \`0\` represents the bottom of the stack).
  - Prefix \`++\` to pop and return the popped value.
  - Output stream operator \`<<\` to output stack contents.
- **Methods:** Also provide standard \`push()\`, \`pop()\`, \`top()\`, \`size()\`, and \`isEmpty()\` methods.`,
    hints: [
      "operator+= pushes: 'stack += 5;' adds 5 to the stack.",
      "operator<< prints all elements from bottom to top: '[1, 2, 3]'.",
    ],
    starterCode: `#include <iostream>
#include <vector>
#include <stdexcept>
using namespace std;

class IntStack {
private:
    vector<int> elems;
public:
    IntStack& operator+=(int val);           // push
    int operator[](int index) const;         // 0 = bottom
    int operator++();                        // prefix: pop and return top
    friend ostream& operator<<(ostream& os, const IntStack& s);

    void push(int val);
    int pop();
    int top() const;
    int size() const;
    bool isEmpty() const;
};

// TODO: Implement all methods.
// operator[]: throw out_of_range if index is invalid
// operator++: throw underflow_error if empty
`,
    testHarness: `int main() {
    int failed = 0;
    auto CHECK = [&](bool cond, const string& name) {
        cout << (cond ? "PASS" : "FAIL") << ": " << name << "\\n";
        if (!cond) failed++;
    };

    IntStack s;
    s += 10;
    s += 20;
    s += 30;
    CHECK(s.size() == 3, "size after 3 pushes");
    CHECK(s[0] == 10, "bottom element");
    CHECK(s[2] == 30, "top element via []");

    int popped = ++s;
    CHECK(popped == 30, "prefix ++ returns popped value");
    CHECK(s.size() == 2, "size decremented after ++");

    cout << s << "\\n"; // Expected: [10, 20]

    bool threw = false;
    try { s[5]; } catch (const out_of_range&) { threw = true; }
    CHECK(threw, "out_of_range thrown on bad index");

    if (failed == 0) cout << "ALL TESTS PASSED\\n";
    return failed;
}`,
  },

  {
    id: "04-fraction",
    categoryIndex: 3,
    difficulty: "advanced",
    title: "Fraction — Full Operator Suite",
    description: `### Fraction — Full Operator Suite

Implement a robust Fraction class with a complete suite of arithmetic, relational, and input/output operators.

**Requirements:**
- **State & Normalization:** Stores integer numerator and denominator. Normalize in the constructor so that the denominator is always positive and the fraction is reduced by its Greatest Common Divisor (GCD).
- **Operators:** Overload \`+\`, \`-\`, \`*\`, \`/\`, relational \`<\`, \`>\`, \`==\`, prefix \`++\`, postfix \`++\`, \`<<\`, and \`>>\`.
- **Validation:** Throw \`std::invalid_argument\` if the denominator is set to \`0\`.`,
    hints: [
      "GCD: int gcd(int a, int b) { return b==0 ? a : gcd(b, a%b); }",
      "Prefix ++: numerator += denominator; normalize; return *this.",
      "operator>>: read 'a/b' or just 'a' from the stream.",
    ],
    starterCode: `#include <iostream>
#include <stdexcept>
using namespace std;

class Fraction {
private:
    int num, den;
    void normalize();
    static int gcd(int a, int b);
public:
    Fraction(int num = 0, int den = 1);

    Fraction operator+(const Fraction& o) const;
    Fraction operator-(const Fraction& o) const;
    Fraction operator*(const Fraction& o) const;
    Fraction operator/(const Fraction& o) const;

    bool operator<(const Fraction& o) const;
    bool operator>(const Fraction& o) const;
    bool operator==(const Fraction& o) const;
    bool operator!=(const Fraction& o) const;

    Fraction& operator++();      // prefix
    Fraction  operator++(int);   // postfix

    friend ostream& operator<<(ostream& os, const Fraction& f);
    friend istream& operator>>(istream& is, Fraction& f);

    int getNum() const { return num; }
    int getDen() const { return den; }
};

// TODO: Implement all methods.
// normalize(): if den<0 flip signs; reduce by gcd
// operator>>: parse "num/den" or just "num"
`,
    testHarness: `#include <sstream>
int main() {
    int failed = 0;
    auto CHECK = [&](bool cond, const string& name) {
        cout << (cond ? "PASS" : "FAIL") << ": " << name << "\\n";
        if (!cond) failed++;
    };

    Fraction a(1, 2), b(1, 3);
    Fraction sum = a + b;
    CHECK(sum.getNum() == 5 && sum.getDen() == 6, "1/2 + 1/3 = 5/6");

    Fraction prod = a * b;
    CHECK(prod.getNum() == 1 && prod.getDen() == 6, "1/2 * 1/3 = 1/6");

    Fraction diff = a - b;
    CHECK(diff.getNum() == 1 && diff.getDen() == 6, "1/2 - 1/3 = 1/6");

    CHECK(b < a, "1/3 < 1/2");
    CHECK(a > b, "1/2 > 1/3");

    Fraction c(3, 4);
    Fraction before = c++;
    CHECK(before.getNum() == 3 && before.getDen() == 4, "postfix returns old");
    CHECK(c.getNum() == 7 && c.getDen() == 4, "postfix ++ adds 1");

    Fraction d(2, 4);
    CHECK(d.getNum() == 1 && d.getDen() == 2, "normalizes 2/4 to 1/2");

    bool threw = false;
    try { Fraction bad(1, 0); } catch (const invalid_argument&) { threw = true; }
    CHECK(threw, "zero denominator throws");

    ostringstream oss; oss << a;
    CHECK(oss.str() == "1/2", "stream output");

    Fraction e;
    istringstream iss("3/7");
    iss >> e;
    CHECK(e.getNum() == 3 && e.getDen() == 7, "stream input");

    if (failed == 0) cout << "ALL TESTS PASSED\\n";
    return failed;
}`,
  },

  // ─── CATEGORY 5: Copy & Move Semantics ──────────────────────────────────────

  {
    id: "05-dynamicarray",
    categoryIndex: 4,
    difficulty: "beginner",
    title: "DynamicArray — Rule of Three",
    description: `### DynamicArray — Rule of Three

Implement a generic DynamicArray container (managing an array of integers) that fully conforms to the **Rule of Three**.

**Requirements:**
- **Rule of Three:** Implement a custom destructor to free the heap array, a copy constructor for deep copying, and a copy assignment operator (safely freeing the old resource first).
- **Methods:**
  - \`push_back()\` to append an element, doubling the internal capacity when full.
  - \`operator[]\` for element access.
  - \`size()\` and \`capacity()\` getters.`,
    hints: [
      "Start with capacity 4. When size==capacity, allocate 2x and copy.",
      "In operator=, always check self-assignment: if (this == &other) return *this;",
    ],
    starterCode: `#include <iostream>
#include <stdexcept>
using namespace std;

class DynamicArray {
private:
    int* data;
    int sz;
    int cap;
public:
    DynamicArray();
    DynamicArray(const DynamicArray& other);       // Rule of 3
    DynamicArray& operator=(const DynamicArray& other);
    ~DynamicArray();

    void push_back(int val);
    int& operator[](int index);
    const int& operator[](int index) const;
    int size() const { return sz; }
    int capacity() const { return cap; }
};

// TODO: Implement all methods.
// push_back: expand capacity if needed (allocate new, copy, delete old)
// operator[]: throw out_of_range for bad index
`,
    testHarness: `int main() {
    int failed = 0;
    auto CHECK = [&](bool cond, const string& name) {
        cout << (cond ? "PASS" : "FAIL") << ": " << name << "\\n";
        if (!cond) failed++;
    };

    DynamicArray a;
    for (int i = 0; i < 10; i++) a.push_back(i * 2);
    CHECK(a.size() == 10, "size after 10 push_backs");
    CHECK(a[4] == 8, "element [4] == 8");
    CHECK(a.capacity() >= 10, "capacity >= size");

    DynamicArray b(a);
    b[0] = 999;
    CHECK(a[0] == 0, "copy is deep");

    DynamicArray c;
    c = a;
    c = c; // self-assign
    CHECK(c[9] == 18, "assignment copies last elem");

    if (failed == 0) cout << "ALL TESTS PASSED\\n";
    return failed;
}`,
  },

  {
    id: "05-uniquebuffer",
    categoryIndex: 4,
    difficulty: "intermediate",
    title: "UniqueBuffer — Move-Only Resource",
    description: `### UniqueBuffer — Move-Only Resource

Implement a move-only UniqueBuffer class modeled after \`std::unique_ptr\`.

**Requirements:**
- **Move-Only:** Explicitly delete the copy constructor and copy assignment operator.
- **Move Semantics:** Provide a move constructor and move assignment operator.
- **State Guarantee:** Ensure the moved-from buffer is left empty (data is \`nullptr\`, size is \`0\`).`,
    hints: [
      "= delete on copy members enforces single ownership at compile time.",
      "noexcept on move members is important — it allows containers to use moves instead of copies.",
    ],
    starterCode: `#include <iostream>
#include <cstring>
using namespace std;

class UniqueBuffer {
private:
    int* data_;
    size_t sz;
public:
    explicit UniqueBuffer(size_t n, int fill = 0);
    UniqueBuffer(const UniqueBuffer&) = delete;
    UniqueBuffer& operator=(const UniqueBuffer&) = delete;
    UniqueBuffer(UniqueBuffer&& other) noexcept;
    UniqueBuffer& operator=(UniqueBuffer&& other) noexcept;
    ~UniqueBuffer();

    int* data() { return data_; }
    const int* data() const { return data_; }
    size_t size() const { return sz; }
    bool isEmpty() const { return sz == 0; }
};

// TODO: Implement constructor, move constructor, move assignment, destructor.
// Move constructor: steal pointer, zero out source.
// Move assignment: swap then let destructor of old handle cleanup.
`,
    testHarness: `#include <utility>
int main() {
    int failed = 0;
    auto CHECK = [&](bool cond, const string& name) {
        cout << (cond ? "PASS" : "FAIL") << ": " << name << "\\n";
        if (!cond) failed++;
    };

    UniqueBuffer b1(5, 42);
    CHECK(b1.size() == 5, "constructed with size 5");
    CHECK(b1.data()[3] == 42, "fill value correct");

    UniqueBuffer b2(move(b1));
    CHECK(b2.size() == 5, "move target has data");
    CHECK(b1.isEmpty(), "move source is empty");
    CHECK(b1.data() == nullptr, "move source pointer is null");

    UniqueBuffer b3(3, 0);
    b3 = move(b2);
    CHECK(b3.size() == 5, "move-assigned size");
    CHECK(b2.isEmpty(), "move-assign source cleared");

    if (failed == 0) cout << "ALL TESTS PASSED\\n";
    return failed;
}`,
  },

  {
    id: "05-smartmatrix",
    categoryIndex: 4,
    difficulty: "advanced",
    title: "SmartMatrix — Rule of Five + Allocation Counting",
    description: `### SmartMatrix

Create a SmartMatrix class representing a 2D matrix of doubles.

**Requirements:**
- **Rule of Five:** Implement the destructor, copy constructor, copy assignment, move constructor, and move assignment.
- **noexcept:** The move members must be marked \`noexcept\`.
- **Allocation Count:** Maintain a static allocation counter to verify that moving does not trigger new heap allocations, while copying does.`,
    hints: [
      "Increment allocationCount in the constructor and copy constructor, NOT in move constructor.",
      "noexcept swap approach for move assignment is the cleanest solution.",
    ],
    starterCode: `#include <iostream>
#include <algorithm>
using namespace std;

class SmartMatrix {
private:
    double* data;
    int rows, cols;
    static int allocationCount;
public:
    SmartMatrix(int rows, int cols, double fill = 0.0);
    SmartMatrix(const SmartMatrix& other);
    SmartMatrix(SmartMatrix&& other) noexcept;
    SmartMatrix& operator=(const SmartMatrix& other);
    SmartMatrix& operator=(SmartMatrix&& other) noexcept;
    ~SmartMatrix();

    double& at(int r, int c);
    static int getAllocationCount() { return allocationCount; }
    static void resetCount() { allocationCount = 0; }
    int getRows() const { return rows; }
    int getCols() const { return cols; }
};

int SmartMatrix::allocationCount = 0;

// TODO: Implement all special members.
// - Constructor and copy constructor must increment allocationCount.
// - Move constructor must NOT increment allocationCount.
`,
    testHarness: `int main() {
    int failed = 0;
    auto CHECK = [&](bool cond, const string& name) {
        cout << (cond ? "PASS" : "FAIL") << ": " << name << "\\n";
        if (!cond) failed++;
    };

    SmartMatrix::resetCount();
    SmartMatrix m1(3, 3, 1.0);
    CHECK(SmartMatrix::getAllocationCount() == 1, "ctor: 1 allocation");

    SmartMatrix m2(m1);
    CHECK(SmartMatrix::getAllocationCount() == 2, "copy ctor: 2 allocations");

    int beforeMove = SmartMatrix::getAllocationCount();
    SmartMatrix m3(move(m1));
    CHECK(SmartMatrix::getAllocationCount() == beforeMove, "move ctor: no new allocation");
    CHECK(m3.getRows() == 3 && m3.getCols() == 3, "move target retains dims");
    CHECK(m3.at(0,0) == 1.0, "move target retains data");

    SmartMatrix m4(2, 2);
    m4 = move(m3);
    CHECK(SmartMatrix::getAllocationCount() == beforeMove, "move assign: no allocation");

    if (failed == 0) cout << "ALL TESTS PASSED\\n";
    return failed;
}`,
  },

  // ─── CATEGORY 6: Inheritance & Abstract Classes ───────────────────────────────

  {
    id: "06-shape",
    categoryIndex: 5,
    difficulty: "beginner",
    title: "Shape Hierarchy",
    description: `### Shape Hierarchy

Build an abstract base class Shape to demonstrate virtual dispatch and interfaces.

**Requirements:**
- **Abstract Base:** Declare pure virtual methods \`area()\` and \`name()\`.
- **Inheritance:** Derive \`Circle\` and \`Rectangle\` classes.
- **Perimeter:** Implement a virtual \`perimeter()\` method with a default implementation that derived classes can optionally override.`,
    hints: [
      "Pure virtual: 'virtual double area() const = 0;'",
      "The base class destructor must be virtual to avoid UB when deleting via base pointer.",
    ],
    starterCode: `#include <iostream>
#include <cmath>
#include <string>
using namespace std;

class Shape {
public:
    virtual ~Shape() = default;
    virtual double area() const = 0;
    virtual double perimeter() const = 0;
    virtual string name() const = 0;
    void describe() const;  // prints: "Circle: area=X, perimeter=Y"
};

class Circle : public Shape {
private:
    double radius;
public:
    explicit Circle(double radius);
    double area() const override;
    double perimeter() const override;
    string name() const override;
};

class Rectangle : public Shape {
private:
    double width, height;
public:
    Rectangle(double width, double height);
    double area() const override;
    double perimeter() const override;
    string name() const override;
};

// TODO: Implement all methods.
// Circle area = pi*r^2, perimeter = 2*pi*r  (use M_PI or 3.14159265358979)
// Rectangle area = w*h, perimeter = 2*(w+h)
// Shape::describe() uses name(), area(), perimeter()
`,
    testHarness: `#include <cmath>
#include <vector>
int main() {
    int failed = 0;
    auto EQ = [](double a, double b) { return fabs(a-b) < 0.001; };
    auto CHECK = [&](bool cond, const string& name) {
        cout << (cond ? "PASS" : "FAIL") << ": " << name << "\\n";
        if (!cond) failed++;
    };

    const double PI = 3.14159265358979;
    Circle c(5.0);
    CHECK(EQ(c.area(), PI*25), "Circle area");
    CHECK(EQ(c.perimeter(), 2*PI*5), "Circle perimeter");
    CHECK(c.name() == "Circle", "Circle name");

    Rectangle r(3.0, 4.0);
    CHECK(EQ(r.area(), 12.0), "Rectangle area");
    CHECK(EQ(r.perimeter(), 14.0), "Rectangle perimeter");

    vector<Shape*> shapes = { new Circle(1.0), new Rectangle(2,3) };
    for (auto* s : shapes) { s->describe(); delete s; }

    if (failed == 0) cout << "ALL TESTS PASSED\\n";
    return failed;
}`,
  },

  {
    id: "06-animal",
    categoryIndex: 5,
    difficulty: "intermediate",
    title: "Animal Hierarchy with Virtual Methods",
    description: `### Animal Hierarchy with Virtual Methods

Create an Animal base class and derived classes to demonstrate virtual method overriding.

**Requirements:**
- **Base Class:** Defines virtual \`speak()\` and \`move()\` methods.
- **Derived Classes:**
  - \`Dog\` (speaks "Woof!", runs)
  - \`Cat\` (speaks "Meow!", slinks)
  - \`Bird\` (speaks "Tweet!", flies)
- **Iteration:** Write a function that processes an array of animal pointers and makes each speak.`,
    hints: [
      "Virtual destructor on Animal prevents memory leaks with derived classes.",
      "makeNoise loops and calls animal->speak() — polymorphism handles the rest.",
    ],
    starterCode: `#include <iostream>
#include <string>
using namespace std;

class Animal {
protected:
    string animalName;
public:
    explicit Animal(const string& name);
    virtual ~Animal() = default;
    virtual void speak() const = 0;
    virtual void move() const = 0;
    const string& getName() const { return animalName; }
    void describe() const;  // "Dog (name): Woof! and runs"
};

class Dog : public Animal {
public: explicit Dog(const string& name);
    void speak() const override;
    void move() const override;
};

class Cat : public Animal {
public: explicit Cat(const string& name);
    void speak() const override;
    void move() const override;
};

class Bird : public Animal {
public: explicit Bird(const string& name);
    void speak() const override;
    void move() const override;
};

void makeNoise(Animal** animals, int count);

// TODO: Implement all classes and makeNoise()
// Dog::speak -> "Woof!", Dog::move -> "runs"
// Cat::speak -> "Meow!", Cat::move -> "slinks"
// Bird::speak -> "Tweet!", Bird::move -> "flies"
`,
    testHarness: `int main() {
    int failed = 0;
    auto CHECK = [&](bool cond, const string& name) {
        cout << (cond ? "PASS" : "FAIL") << ": " << name << "\\n";
        if (!cond) failed++;
    };

    Animal* pets[] = { new Dog("Rex"), new Cat("Whiskers"), new Bird("Tweety") };
    makeNoise(pets, 3);

    CHECK(dynamic_cast<Dog*>(pets[0]) != nullptr, "first is Dog");
    CHECK(dynamic_cast<Cat*>(pets[1]) != nullptr, "second is Cat");
    CHECK(dynamic_cast<Bird*>(pets[2]) != nullptr, "third is Bird");
    CHECK(pets[0]->getName() == "Rex", "dog name");

    for (auto* a : pets) delete a;

    if (failed == 0) cout << "ALL TESTS PASSED\\n";
    return failed;
}`,
  },

  {
    id: "06-vehicle",
    categoryIndex: 5,
    difficulty: "advanced",
    title: "Vehicle Hierarchy — Pure Virtuals & Override",
    description: `### Vehicle Hierarchy

Design a complex Vehicle base class hierarchy utilizing RTTI and dynamic casting.

**Requirements:**
- **Base Class:** Abstract class with pure virtual \`fuelType()\`, \`startEngine()\`, and \`range() const\`.
- **Derived Classes:** \`ElectricCar\`, \`GasCar\`, and \`Hybrid\`.
- **Downcasting:** Use \`dynamic_cast\` to safely check if a generic Vehicle pointer points to an \`ElectricCar\`.`,
    hints: [
      "Abstract classes cannot be instantiated — trying to will give a compile error.",
      "Hybrid can hold two member ranges (electric, gas) and sum them in range().",
    ],
    starterCode: `#include <iostream>
#include <string>
using namespace std;

class Vehicle {
protected:
    string brand;
    int year;
public:
    Vehicle(const string& brand, int year);
    virtual ~Vehicle() = default;
    virtual string fuelType() const = 0;
    virtual void startEngine() const = 0;
    virtual double range() const = 0;
    virtual void describe() const;
    const string& getBrand() const { return brand; }
};

class ElectricCar : public Vehicle {
    double batteryRange;
public:
    ElectricCar(const string& brand, int year, double range);
    string fuelType() const override;
    void startEngine() const override;   // "Silent start"
    double range() const override;
};

class GasCar : public Vehicle {
    double tankRange;
public:
    GasCar(const string& brand, int year, double range);
    string fuelType() const override;
    void startEngine() const override;   // "Vroom!"
    double range() const override;
};

class Hybrid : public Vehicle {
    double electricRange, gasRange;
public:
    Hybrid(const string& brand, int year, double eRange, double gRange);
    string fuelType() const override;
    void startEngine() const override;   // "Quiet start, then engine"
    double range() const override;       // sum of both
};

// TODO: Implement all classes.
`,
    testHarness: `#include <cmath>
int main() {
    int failed = 0;
    auto EQ = [](double a, double b) { return fabs(a-b) < 0.1; };
    auto CHECK = [&](bool cond, const string& name) {
        cout << (cond ? "PASS" : "FAIL") << ": " << name << "\\n";
        if (!cond) failed++;
    };

    Vehicle* fleet[] = {
        new ElectricCar("Tesla", 2024, 500.0),
        new GasCar("BMW", 2023, 700.0),
        new Hybrid("Toyota", 2024, 80.0, 600.0)
    };

    for (auto* v : fleet) v->describe();

    CHECK(fleet[0]->fuelType() == "Electric", "ElectricCar fuel type");
    CHECK(fleet[1]->fuelType() == "Gasoline", "GasCar fuel type");
    CHECK(fleet[2]->fuelType() == "Hybrid",   "Hybrid fuel type");
    CHECK(EQ(fleet[2]->range(), 680.0), "Hybrid range = 80+600");

    ElectricCar* e = dynamic_cast<ElectricCar*>(fleet[0]);
    CHECK(e != nullptr, "dynamic_cast to ElectricCar succeeds");
    GasCar* g = dynamic_cast<GasCar*>(fleet[0]);
    CHECK(g == nullptr, "dynamic_cast ElectricCar to GasCar fails");

    for (auto* v : fleet) delete v;

    if (failed == 0) cout << "ALL TESTS PASSED\\n";
    return failed;
}`,
  },

  // ─── CATEGORY 7: Polymorphism ─────────────────────────────────────────────────

  {
    id: "07-car-fleet",
    categoryIndex: 6,
    difficulty: "beginner",
    title: "Car Fleet with Virtual Dispatch",
    description: `### Car Fleet

Manage a polymorphic fleet of cars using a virtual destructor.

**Requirements:**
- **Base Class:** \`Car\` with a virtual \`display()\` method.
- **Derived Classes:** \`SportsCar\` (with max speed) and \`Truck\` (with payload capacity).
- **Polymorphic Array:** Manage a list of raw pointers to cars and invoke virtual methods cleanly.`,
    hints: [
      "Car::display() is pure virtual — it forces all derived classes to implement it.",
      "displayFleet(Car** fleet, int n) just loops and calls fleet[i]->display().",
    ],
    starterCode: `#include <iostream>
#include <string>
using namespace std;

class Car {
protected:
    string brand;
    int year;
public:
    Car(const string& brand, int year);
    virtual ~Car() = default;
    virtual void display() const = 0;
    const string& getBrand() const { return brand; }
};

class SportsCar : public Car {
    int maxSpeedKmh;
public:
    SportsCar(const string& brand, int year, int maxSpeed);
    void display() const override;
    // Prints: "SportsCar: brand (year), max speed: Xkm/h"
};

class Truck : public Car {
    double payloadTons;
public:
    Truck(const string& brand, int year, double payload);
    void display() const override;
    // Prints: "Truck: brand (year), payload: Xt"
};

void displayFleet(Car** fleet, int n);

// TODO: Implement all classes and displayFleet()
`,
    testHarness: `int main() {
    int failed = 0;
    auto CHECK = [&](bool cond, const string& name) {
        cout << (cond ? "PASS" : "FAIL") << ": " << name << "\\n";
        if (!cond) failed++;
    };

    Car* fleet[5] = {
        new SportsCar("Ferrari", 2023, 320),
        new Truck("Volvo", 2022, 20.0),
        new SportsCar("Lamborghini", 2024, 350),
        new Truck("Scania", 2023, 25.0),
        new SportsCar("Porsche", 2023, 290),
    };

    displayFleet(fleet, 5);

    CHECK(dynamic_cast<SportsCar*>(fleet[0]) != nullptr, "fleet[0] is SportsCar");
    CHECK(dynamic_cast<Truck*>(fleet[1]) != nullptr, "fleet[1] is Truck");
    CHECK(fleet[2]->getBrand() == "Lamborghini", "brand access via base ptr");

    for (auto* c : fleet) delete c;

    if (failed == 0) cout << "ALL TESTS PASSED\\n";
    return failed;
}`,
  },

  {
    id: "07-race-sim",
    categoryIndex: 6,
    difficulty: "intermediate",
    title: "Race Simulation — ShowFinalRanks",
    description: `### Race Simulation

Implement an abstract race simulation tracking rankings.

**Requirements:**
- **Base Class:** \`Racer\` with virtual \`simulate()\` and \`getFinishPosition()\` methods.
- **Derived Classes:** \`F1Racer\` and \`RallyRacer\`.
- **Sorting:** Write a function \`ShowFinalRanks\` to output racers sorted by finish position.`,
    hints: [
      "Store an integer finish position set by simulate() or the constructor.",
      "Sort using std::sort with a comparator on getFinishPosition().",
    ],
    starterCode: `#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

class Racer {
protected:
    string racerName;
    int finishPos;
public:
    Racer(const string& name, int pos);
    virtual ~Racer() = default;
    virtual int getFinishPosition() const;
    virtual string getType() const = 0;
    const string& getName() const { return racerName; }
    virtual void display() const;
    // Prints: "[type] racerName — Position: N"
};

class F1Racer : public Racer {
    string team;
public:
    F1Racer(const string& name, const string& team, int pos);
    string getType() const override;
    void display() const override;
};

class RallyRacer : public Racer {
    string country;
public:
    RallyRacer(const string& name, const string& country, int pos);
    string getType() const override;
    void display() const override;
};

void ShowFinalRanks(Racer** racers, int n);

// TODO: Implement all classes and ShowFinalRanks().
// ShowFinalRanks: sort by position ascending, then call display() for each.
`,
    testHarness: `int main() {
    int failed = 0;
    auto CHECK = [&](bool cond, const string& name) {
        cout << (cond ? "PASS" : "FAIL") << ": " << name << "\\n";
        if (!cond) failed++;
    };

    Racer* racers[5] = {
        new F1Racer("Hamilton", "Mercedes", 3),
        new RallyRacer("Loeb", "France", 1),
        new F1Racer("Verstappen", "Red Bull", 2),
        new RallyRacer("Ogier", "France", 5),
        new F1Racer("Leclerc", "Ferrari", 4),
    };

    cout << "=== Final Ranks ===\\n";
    ShowFinalRanks(racers, 5);

    CHECK(racers[0]->getFinishPosition() == 3, "Hamilton position unchanged");
    CHECK(dynamic_cast<RallyRacer*>(racers[1]) != nullptr, "Loeb is RallyRacer");

    for (auto* r : racers) delete r;

    if (failed == 0) cout << "ALL TESTS PASSED\\n";
    return failed;
}`,
  },

  {
    id: "07-f1-championship",
    categoryIndex: 6,
    difficulty: "advanced",
    title: "F1 Championship — ShowWhoDidNotFinish",
    description: `### F1 Championship Tracker

Build a comprehensive F1 Championship tracking system.

**Requirements:**
- **Base Class:** \`F1Car\` with virtual \`didFinish()\` and \`lapTime()\` methods.
- **Reporting:** Show final ranks for cars that finished, and separate lists for those that did not finish with their failure reasons.`,
    hints: [
      "DNF cars can have a 'reason' string set in their constructor.",
      "Use std::sort with a lambda comparing lapTime() for finishers.",
    ],
    starterCode: `#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
using namespace std;

class F1Car {
protected:
    string driverName;
    string team;
    bool finished;
    double lapTimeSeconds;
    string dnfReason;
public:
    F1Car(const string& driver, const string& team,
          bool finished, double lapTime, const string& dnfReason = "");
    virtual ~F1Car() = default;
    virtual bool didFinish() const;
    virtual double lapTime() const;
    virtual string teamName() const;
    const string& getDriver() const { return driverName; }
    const string& getDnfReason() const { return dnfReason; }
    virtual void display() const;
};

class FactoryCar : public F1Car {
public:
    FactoryCar(const string& driver, const string& team,
               bool finished, double lapTime, const string& dnf = "");
    string teamName() const override;   // prepend "[Factory] "
    void display() const override;
};

class PremiumCar : public F1Car {
public:
    PremiumCar(const string& driver, const string& team,
               bool finished, double lapTime, const string& dnf = "");
    string teamName() const override;   // prepend "[Premium] "
    void display() const override;
};

void ShowFinalRanks(F1Car** grid, int n);
void ShowWhoDidNotFinish(F1Car** grid, int n);

// TODO: Implement all classes and both functions.
`,
    testHarness: `int main() {
    int failed = 0;
    auto CHECK = [&](bool cond, const string& name) {
        cout << (cond ? "PASS" : "FAIL") << ": " << name << "\\n";
        if (!cond) failed++;
    };

    F1Car* grid[6] = {
        new FactoryCar("Verstappen", "Red Bull", true,  90.5),
        new PremiumCar("Hamilton",   "Mercedes", true,  91.2),
        new FactoryCar("Leclerc",    "Ferrari",  false, 0,   "Engine failure"),
        new PremiumCar("Norris",     "McLaren",  true,  91.8),
        new FactoryCar("Sainz",      "Ferrari",  false, 0,   "Collision"),
        new PremiumCar("Russell",    "Mercedes", true,  92.1),
    };

    cout << "=== Final Ranks ===\\n";
    ShowFinalRanks(grid, 6);

    cout << "=== Did Not Finish ===\\n";
    ShowWhoDidNotFinish(grid, 6);

    int finishers = 0, dnf = 0;
    for (int i = 0; i < 6; i++) {
        if (grid[i]->didFinish()) finishers++; else dnf++;
    }
    CHECK(finishers == 4, "4 finishers");
    CHECK(dnf == 2, "2 DNFs");

    for (auto* c : grid) delete c;

    if (failed == 0) cout << "ALL TESTS PASSED\\n";
    return failed;
}`,
  },

  // ─── CATEGORY 8: Templates ───────────────────────────────────────────────────

  {
    id: "08-pair",
    categoryIndex: 7,
    difficulty: "beginner",
    title: "Pair<T,U> Template",
    description: `### Pair Template

Create a simple generic \`Pair<T, U>\` template class.

**Requirements:**
- **Templates:** Implement \`Pair\` holding two values of potentially different types.
- **Utility:** Provide \`swap()\` and operator overload for streaming output.`,
    hints: [
      "Template class definition: 'template<typename T, typename U> class Pair { ... };'",
      "operator<< must also be a template or a friend template.",
    ],
    starterCode: `#include <iostream>
#include <string>
using namespace std;

template<typename T, typename U>
class Pair {
public:
    T first;
    U second;

    Pair(const T& first, const U& second);
    void swap();   // exchanges first and second (only valid when T==U)
    // For simplicity, only implement swap() for Pair<T,T>
};

template<typename T, typename U>
ostream& operator<<(ostream& os, const Pair<T,U>& p);

template<typename T, typename U>
Pair<T,U> makePair(const T& a, const U& b);

// TODO: Implement Pair constructor, swap(), operator<<, makePair()
`,
    testHarness: `int main() {
    int failed = 0;
    auto CHECK = [&](bool cond, const string& name) {
        cout << (cond ? "PASS" : "FAIL") << ": " << name << "\\n";
        if (!cond) failed++;
    };

    Pair<int, string> p1(42, "hello");
    CHECK(p1.first == 42 && p1.second == "hello", "int,string pair");

    auto p2 = makePair(3.14, true);
    CHECK(p2.first == 3.14, "makePair double");

    Pair<int,int> p3(10, 20);
    p3.swap();
    CHECK(p3.first == 20 && p3.second == 10, "swap works");

    cout << p1 << "\\n"; // Expected: (42, hello)
    cout << p3 << "\\n"; // Expected: (20, 10)

    if (failed == 0) cout << "ALL TESTS PASSED\\n";
    return failed;
}`,
  },

  {
    id: "08-template-stack",
    categoryIndex: 7,
    difficulty: "intermediate",
    title: "Stack<T> Without STL",
    description: `### Stack Template

Implement a generic \`Stack<T>\` template class without using STL containers.

**Requirements:**
- **Dynamic Array:** Back the stack with a dynamic array that grows on demand.
- **Exceptions:** Throw \`std::underflow_error\` on popping from an empty stack.`,
    hints: [
      "Use 'new T[capacity]' and track sz separately from capacity.",
      "Copy constructor: allocate new array, copy elements one by one.",
    ],
    starterCode: `#include <iostream>
#include <stdexcept>
#include <string>
using namespace std;

template<typename T>
class Stack {
private:
    T* data;
    int sz;
    int cap;
    void grow();
public:
    Stack();
    Stack(const Stack<T>& other);
    Stack& operator=(const Stack<T>& other);
    ~Stack();

    void push(const T& val);
    void pop();
    T& top();
    const T& top() const;
    bool isEmpty() const;
    int size() const;
};

// TODO: Implement all template methods.
// grow(): double capacity, allocate new array, copy elements, delete old
`,
    testHarness: `int main() {
    int failed = 0;
    auto CHECK = [&](bool cond, const string& name) {
        cout << (cond ? "PASS" : "FAIL") << ": " << name << "\\n";
        if (!cond) failed++;
    };

    Stack<int> si;
    for (int i = 1; i <= 10; i++) si.push(i);
    CHECK(si.size() == 10, "int stack: size 10");
    CHECK(si.top() == 10, "int stack: top is 10");
    si.pop();
    CHECK(si.top() == 9, "int stack: top after pop");

    Stack<int> si2(si);
    si2.push(99);
    CHECK(si.top() == 9, "copy is deep");

    Stack<string> ss;
    ss.push("alpha");
    ss.push("beta");
    CHECK(ss.top() == "beta", "string stack top");

    bool threw = false;
    Stack<int> empty;
    try { empty.pop(); } catch (const underflow_error&) { threw = true; }
    CHECK(threw, "pop empty throws underflow_error");

    if (failed == 0) cout << "ALL TESTS PASSED\\n";
    return failed;
}`,
  },

  {
    id: "08-sorter",
    categoryIndex: 7,
    difficulty: "advanced",
    title: "Template Sorter with Specialization",
    description: `### Template Sorter with Specialization

Write template functions demonstrating template specialization.

**Requirements:**
- **Generic Sort:** Implement insertion sort template.
- **Specialization:** Specialize the sort function for \`const char*\` to perform lexicographical comparison using \`strcmp\`.`,
    hints: [
      "Template specialization syntax: 'template<> void sort<const char*>(const char** arr, int n) { ... }'",
      "For const char*, compare with strcmp(a, b) < 0 for ascending order.",
    ],
    starterCode: `#include <iostream>
#include <cstring>
#include <string>
using namespace std;

// Generic sort (insertion sort)
template<typename T>
void sort(T* arr, int n) {
    // TODO: implement insertion sort for generic T (uses operator<)
}

// Specialization for C strings
template<>
void sort<const char*>(const char** arr, int n) {
    // TODO: implement insertion sort using strcmp for const char*
}

// Generic isSorted predicate
template<typename T>
bool isSorted(const T* arr, int n) {
    // TODO: return true if arr[i] <= arr[i+1] for all i
}

// Specialization for C strings
template<>
bool isSorted<const char*>(const char* const* arr, int n) {
    // TODO: use strcmp
}

// TODO: Implement all four functions
`,
    testHarness: `int main() {
    int failed = 0;
    auto CHECK = [&](bool cond, const string& name) {
        cout << (cond ? "PASS" : "FAIL") << ": " << name << "\\n";
        if (!cond) failed++;
    };

    int nums[] = {5, 2, 8, 1, 9, 3};
    sort<int>(nums, 6);
    CHECK(isSorted<int>(nums, 6), "int array sorted");
    CHECK(nums[0] == 1 && nums[5] == 9, "int min/max correct");

    double dbls[] = {3.14, 1.41, 2.71, 0.57};
    sort<double>(dbls, 4);
    CHECK(isSorted<double>(dbls, 4), "double array sorted");

    const char* words[] = {"banana", "apple", "cherry", "date"};
    sort<const char*>(words, 4);
    CHECK(isSorted<const char*>(words, 4), "string array sorted");
    CHECK(strcmp(words[0], "apple") == 0, "first word is apple");
    CHECK(strcmp(words[3], "date") == 0, "last word is date");

    if (failed == 0) cout << "ALL TESTS PASSED\\n";
    return failed;
}`,
  },

  // ─── CATEGORY 9: STL Usage ───────────────────────────────────────────────────

  {
    id: "09-word-freq",
    categoryIndex: 8,
    difficulty: "beginner",
    title: "Word Frequency Counter",
    description: `### Word Frequency Counter

Build a WordCounter class using standard library associative containers.

**Requirements:**
- **Word Counting:** Use \`std::map<std::string, int>\` to track word occurrences.
- **Top N:** Implement a method returning the top \`n\` most frequent words.`,
    hints: [
      "Use std::istringstream to split a string by whitespace.",
      "For topN, copy map pairs to a vector and std::sort by count descending.",
    ],
    starterCode: `#include <iostream>
#include <string>
#include <map>
#include <vector>
#include <sstream>
#include <algorithm>
using namespace std;

class WordCounter {
private:
    map<string, int> freq;
public:
    void addText(const string& text);
    vector<pair<string,int>> topN(int n) const;
    void print() const;
    int getCount(const string& word) const;
    int uniqueWords() const;
};

// TODO: Implement all methods.
// addText: split by spaces, increment freq[word]
// topN: sort by count desc, then by word asc for ties; return first n
// print: iterate map (already alphabetical) and output "word: count"
`,
    testHarness: `int main() {
    int failed = 0;
    auto CHECK = [&](bool cond, const string& name) {
        cout << (cond ? "PASS" : "FAIL") << ": " << name << "\\n";
        if (!cond) failed++;
    };

    WordCounter wc;
    wc.addText("the quick brown fox");
    wc.addText("the fox jumped over the lazy dog");
    wc.addText("the dog barked");

    CHECK(wc.getCount("the") == 4, "the appears 4 times");
    CHECK(wc.getCount("fox") == 2, "fox appears 2 times");
    CHECK(wc.getCount("cat") == 0, "cat never appeared");
    CHECK(wc.uniqueWords() == 9, "9 unique words");

    auto top3 = wc.topN(3);
    CHECK(top3.size() == 3, "topN returns 3");
    CHECK(top3[0].first == "the" && top3[0].second == 4, "top word is 'the' with 4");

    cout << "Frequency table:\\n";
    wc.print();

    if (failed == 0) cout << "ALL TESTS PASSED\\n";
    return failed;
}`,
  },

  {
    id: "09-task-scheduler",
    categoryIndex: 8,
    difficulty: "intermediate",
    title: "Priority Task Scheduler",
    description: `### Priority Task Scheduler

Design a task scheduler using standard library priority queues.

**Requirements:**
- **Queueing:** Use \`std::priority_queue\` to store and sort tasks.
- **Priority:** Tasks are sorted and run based on integer priority (highest first).`,
    hints: [
      "Provide a custom comparator or define operator< on Task for priority_queue.",
      "priority_queue is a max-heap by default — use priority as the key directly.",
    ],
    starterCode: `#include <iostream>
#include <string>
#include <queue>
#include <vector>
#include <stdexcept>
using namespace std;

struct Task {
    int id;
    string name;
    int priority;

    // TODO: define operator< so priority_queue orders by priority descending
    // (higher priority = processed first)
    bool operator<(const Task& other) const;
};

class Scheduler {
private:
    priority_queue<Task> queue;
    int nextId;
public:
    Scheduler();
    void schedule(const string& name, int priority);
    Task runNext();          // throws underflow_error if empty
    int pendingCount() const;
    bool isEmpty() const;
};

// TODO: Implement Task::operator< and all Scheduler methods.
// Task ids are auto-assigned (incrementing counter in schedule()).
`,
    testHarness: `int main() {
    int failed = 0;
    auto CHECK = [&](bool cond, const string& name) {
        cout << (cond ? "PASS" : "FAIL") << ": " << name << "\\n";
        if (!cond) failed++;
    };

    Scheduler s;
    s.schedule("Low priority cleanup", 1);
    s.schedule("Critical security patch", 10);
    s.schedule("Normal update", 5);
    s.schedule("High priority bug fix", 8);
    s.schedule("Routine maintenance", 3);

    CHECK(s.pendingCount() == 5, "5 tasks scheduled");

    Task t1 = s.runNext();
    CHECK(t1.priority == 10, "highest priority runs first");
    CHECK(t1.name == "Critical security patch", "correct task name");

    Task t2 = s.runNext();
    CHECK(t2.priority == 8, "second highest priority");

    CHECK(s.pendingCount() == 3, "3 remaining");

    while (!s.isEmpty()) {
        Task t = s.runNext();
        cout << "Running: " << t.name << " (priority " << t.priority << ")\\n";
    }

    bool threw = false;
    try { s.runNext(); } catch (const underflow_error&) { threw = true; }
    CHECK(threw, "runNext on empty throws");

    if (failed == 0) cout << "ALL TESTS PASSED\\n";
    return failed;
}`,
  },

  {
    id: "09-gradebook",
    categoryIndex: 8,
    difficulty: "advanced",
    title: "GradeBook with STL Algorithms",
    description: `### GradeBook with STL Algorithms

Build a GradeBook application using STL maps and vectors.

**Requirements:**
- **Grades:** Store grades in a \`std::map<std::string, std::vector<int>>\`.
- **Analysis:** Implement methods to calculate student averages and identify top/failing students.`,
    hints: [
      "Use std::accumulate for computing sums.",
      "Build a vector of (name, average) pairs, then std::sort descending for topStudents.",
    ],
    starterCode: `#include <iostream>
#include <string>
#include <map>
#include <vector>
#include <numeric>
#include <algorithm>
#include <stdexcept>
using namespace std;

class GradeBook {
private:
    map<string, vector<int>> records;
public:
    void addGrade(const string& student, int grade);
    double getAverage(const string& student) const;
    vector<string> topStudents(int n) const;
    vector<string> failingStudents() const;
    int studentCount() const;
    const vector<int>& getGrades(const string& student) const;
};

// TODO: Implement all methods.
// getAverage: throw invalid_argument if student not found
// topStudents: sort by average desc, return first n names
// failingStudents: return names where average < 50.0
`,
    testHarness: `int main() {
    int failed = 0;
    auto EQ = [](double a, double b){ return fabs(a-b) < 0.01; };
    auto CHECK = [&](bool cond, const string& name) {
        cout << (cond ? "PASS" : "FAIL") << ": " << name << "\\n";
        if (!cond) failed++;
    };

    GradeBook gb;
    gb.addGrade("Alice", 90); gb.addGrade("Alice", 85); gb.addGrade("Alice", 92);
    gb.addGrade("Bob",   40); gb.addGrade("Bob",   55); gb.addGrade("Bob",   35);
    gb.addGrade("Carol", 75); gb.addGrade("Carol", 80);
    gb.addGrade("Dave",  45); gb.addGrade("Dave",  48);

    CHECK(gb.studentCount() == 4, "4 students");
    CHECK(EQ(gb.getAverage("Alice"), 89.0), "Alice average");
    CHECK(EQ(gb.getAverage("Bob"), 43.33), "Bob average");

    auto top2 = gb.topStudents(2);
    CHECK(top2.size() == 2, "topStudents returns 2");
    CHECK(top2[0] == "Alice", "top student is Alice");
    CHECK(top2[1] == "Carol", "second student is Carol");

    auto failing = gb.failingStudents();
    CHECK(failing.size() == 2, "2 failing students");

    bool threw = false;
    try { gb.getAverage("Nobody"); } catch (const invalid_argument&) { threw = true; }
    CHECK(threw, "unknown student throws");

    if (failed == 0) cout << "ALL TESTS PASSED\\n";
    return failed;
}`,
  },

  // ─── CATEGORY 10: Exceptions ─────────────────────────────────────────────────

  {
    id: "10-safe-divide",
    categoryIndex: 9,
    difficulty: "beginner",
    title: "Custom Exception — SafeDivide",
    description: `### Custom Exception — SafeDivide

Design custom exceptions derived from \`std::exception\`.

**Requirements:**
- **Custom Exceptions:** Define \`DivisionByZeroException\` and \`NegativeInputException\`.
- **Throwing:** Throw exceptions from \`safeDivide()\` and \`safeSqrt()\` under invalid input conditions.`,
    hints: [
      "Override 'const char* what() const noexcept override { return \"...\"; }'",
      "Derive from std::exception or std::invalid_argument.",
    ],
    starterCode: `#include <iostream>
#include <stdexcept>
#include <cmath>
#include <string>
using namespace std;

class DivisionByZeroException : public exception {
public:
    const char* what() const noexcept override;
};

class NegativeInputException : public exception {
    string msg;
public:
    explicit NegativeInputException(double val);
    const char* what() const noexcept override;
};

double safeDivide(double a, double b);
double safeSqrt(double x);

// TODO: Implement both exception classes and both functions.
// safeDivide: throw DivisionByZeroException if b == 0
// safeSqrt: throw NegativeInputException(x) if x < 0
`,
    testHarness: `int main() {
    int failed = 0;
    auto CHECK = [&](bool cond, const string& name) {
        cout << (cond ? "PASS" : "FAIL") << ": " << name << "\\n";
        if (!cond) failed++;
    };

    CHECK(safeDivide(10.0, 2.0) == 5.0, "normal division");

    bool threw = false;
    try { safeDivide(5.0, 0.0); }
    catch (const DivisionByZeroException& e) {
        threw = true;
        CHECK(string(e.what()).length() > 0, "what() is non-empty");
    }
    CHECK(threw, "DivisionByZeroException thrown");

    CHECK(fabs(safeSqrt(9.0) - 3.0) < 1e-9, "safeSqrt of 9");

    bool threw2 = false;
    try { safeSqrt(-1.0); }
    catch (const NegativeInputException& e) {
        threw2 = true;
        CHECK(string(e.what()).find("-1") != string::npos, "error message contains value");
    }
    CHECK(threw2, "NegativeInputException thrown");

    // Catch by base class
    bool base = false;
    try { safeDivide(1.0, 0.0); } catch (const exception&) { base = true; }
    CHECK(base, "catches via std::exception base");

    if (failed == 0) cout << "ALL TESTS PASSED\\n";
    return failed;
}`,
  },

  {
    id: "10-db-exceptions",
    categoryIndex: 9,
    difficulty: "intermediate",
    title: "Database Exception Hierarchy",
    description: `### Database Exception Hierarchy

Implement an inheritance hierarchy of exception classes.

**Requirements:**
- **Exception Base:** \`DBException\` base class.
- **Derived Exceptions:** \`ConnectionException\`, \`QueryException\`, and \`TimeoutException\` with distinct error codes.`,
    hints: [
      "Store the error code in the base class, provide a virtual getCode() accessor.",
      "QueryException::what() should include the query string in the message.",
    ],
    starterCode: `#include <iostream>
#include <stdexcept>
#include <string>
using namespace std;

class DBException : public exception {
protected:
    int code;
    string details;
    mutable string msg; // for what() storage
public:
    DBException(int code, const string& details);
    virtual int getCode() const;
    const char* what() const noexcept override;
};

class ConnectionException : public DBException {
public:
    explicit ConnectionException(const string& host);
    const char* what() const noexcept override;
};

class QueryException : public DBException {
    string query;
public:
    QueryException(const string& query, const string& reason);
    const char* what() const noexcept override;
};

class TimeoutException : public DBException {
    int timeoutMs;
public:
    TimeoutException(int ms, const string& operation);
    const char* what() const noexcept override;
};

// Helper functions that throw
void connectDB(const string& host);       // throws ConnectionException if host=="bad"
void runQuery(const string& q);           // throws QueryException if q starts with "DROP"
void longOperation(int ms);              // throws TimeoutException if ms > 5000

// TODO: Implement all exception classes and helper functions.
`,
    testHarness: `int main() {
    int failed = 0;
    auto CHECK = [&](bool cond, const string& name) {
        cout << (cond ? "PASS" : "FAIL") << ": " << name << "\\n";
        if (!cond) failed++;
    };

    // Test ConnectionException
    try { connectDB("bad"); CHECK(false, "should throw"); }
    catch (const ConnectionException& e) {
        CHECK(e.getCode() == 1001, "connection error code 1001");
        CHECK(string(e.what()).find("bad") != string::npos, "what() mentions host");
    }

    // Test QueryException
    try { runQuery("DROP TABLE users"); CHECK(false, "should throw"); }
    catch (const QueryException& e) {
        CHECK(e.getCode() == 1002, "query error code 1002");
        CHECK(string(e.what()).find("DROP") != string::npos, "what() mentions query");
    }

    // Test TimeoutException
    try { longOperation(10000); CHECK(false, "should throw"); }
    catch (const TimeoutException& e) {
        CHECK(e.getCode() == 1003, "timeout error code 1003");
        CHECK(string(e.what()).find("10000") != string::npos, "what() mentions ms");
    }

    // Catch by base
    try { connectDB("bad"); }
    catch (const DBException& e) { CHECK(true, "caught via base DBException"); }

    // Normal operations don't throw
    connectDB("localhost");
    runQuery("SELECT * FROM users");
    longOperation(100);
    CHECK(true, "normal operations succeed");

    if (failed == 0) cout << "ALL TESTS PASSED\\n";
    return failed;
}`,
  },

  {
    id: "10-safevector",
    categoryIndex: 9,
    difficulty: "advanced",
    title: "SafeVector<T> — Exception-Safe Container",
    description: `### SafeVector — Exception-Safe Container

Build an exception-safe generic container.

**Requirements:**
- **Bounds Checking:** Throw \`OutOfBoundsException\` on invalid element access.
- **RAII:** Ensure strong exception safety guarantees (no leaks if allocations fail).`,
    hints: [
      "Exception safety: allocate new buffer, copy elements, only then replace the old pointer.",
      "If copying throws during push_back expansion, the old buffer is still valid — restore it.",
    ],
    starterCode: `#include <iostream>
#include <stdexcept>
#include <string>
#include <new>
using namespace std;

class OutOfBoundsException : public exception {
    string msg;
public:
    OutOfBoundsException(int index, int size);
    const char* what() const noexcept override;
};

template<typename T>
class SafeVector {
private:
    T* data;
    int sz;
    int cap;
    void grow();
public:
    SafeVector();
    SafeVector(const SafeVector& other);
    SafeVector& operator=(const SafeVector& other);
    ~SafeVector();

    void push_back(const T& val);
    T& at(int index);                  // throws OutOfBoundsException
    const T& at(int index) const;
    T& operator[](int index);          // no bounds check
    int size() const { return sz; }
    int capacity() const { return cap; }
    T* begin() { return data; }
    T* end()   { return data + sz; }
};

// TODO: Implement OutOfBoundsException and SafeVector.
// grow(): strong exception guarantee — if copy throws, revert to old state.
`,
    testHarness: `int main() {
    int failed = 0;
    auto CHECK = [&](bool cond, const string& name) {
        cout << (cond ? "PASS" : "FAIL") << ": " << name << "\\n";
        if (!cond) failed++;
    };

    SafeVector<int> v;
    for (int i = 0; i < 20; i++) v.push_back(i * 3);
    CHECK(v.size() == 20, "size after 20 push_backs");
    CHECK(v.at(0) == 0 && v.at(19) == 57, "at() access");

    bool threw = false;
    try { v.at(50); } catch (const OutOfBoundsException& e) {
        threw = true;
        CHECK(string(e.what()).find("50") != string::npos, "error mentions bad index");
    }
    CHECK(threw, "OutOfBoundsException on bad index");

    SafeVector<int> v2(v);
    v2.at(0) = 999;
    CHECK(v.at(0) == 0, "copy is deep");

    // iterator
    int sum = 0;
    for (auto* it = v.begin(); it != v.end(); ++it) sum += *it;
    CHECK(sum == (0+3+6+9+12+15+18+21+24+27+30+33+36+39+42+45+48+51+54+57), "iterator sum");

    if (failed == 0) cout << "ALL TESTS PASSED\\n";
    return failed;
}`,
  },

  // ─── CATEGORY 11: User-Defined Literals ──────────────────────────────────────

  {
    id: "11-distance",
    categoryIndex: 10,
    difficulty: "beginner",
    title: "Distance Literals",
    description: `### Distance Literals

Implement user-defined literal operators in C++.

**Requirements:**
- **Literals:** Implement \`_km\` and \`_m\` literal suffixes returning \`Distance\` objects.
- **Operators:** Overload addition, comparison, and output streaming operators.`,
    hints: [
      "Literal operators: 'Distance operator\"\"_km(long double km) { return Distance(km * 1000); }'",
      "Use 'long double' parameter for floating-point user-defined literals.",
    ],
    starterCode: `#include <iostream>
#include <cmath>
using namespace std;

class Distance {
private:
    double meters;
public:
    explicit Distance(double meters = 0.0);
    Distance operator+(const Distance& other) const;
    bool operator==(const Distance& other) const;
    double getMeters() const;
    friend ostream& operator<<(ostream& os, const Distance& d);
};

Distance operator""_km(long double km);
Distance operator""_m(long double m);
Distance operator""_km(unsigned long long km);
Distance operator""_m(unsigned long long m);

// TODO: Implement Distance class and all literal operators.
// operator==: use fabs(a-b) < 1e-9
`,
    testHarness: `int main() {
    int failed = 0;
    auto CHECK = [&](bool cond, const string& name) {
        cout << (cond ? "PASS" : "FAIL") << ": " << name << "\\n";
        if (!cond) failed++;
    };

    Distance d1 = 1.5_km;
    Distance d2 = 500.0_m;
    Distance total = d1 + d2;

    CHECK(fabs(d1.getMeters() - 1500.0) < 1e-9, "1.5km = 1500m");
    CHECK(fabs(d2.getMeters() - 500.0)  < 1e-9, "500m = 500m");
    CHECK(fabs(total.getMeters() - 2000.0) < 1e-9, "sum is 2000m");

    Distance marathon = 42.195_km;
    CHECK(fabs(marathon.getMeters() - 42195.0) < 0.01, "marathon distance");

    Distance a = 1000.0_m;
    Distance b = 1_km;
    CHECK(a == b, "1000m == 1km");

    cout << "Total: " << total << "\\n"; // Expected: 2000 m

    if (failed == 0) cout << "ALL TESTS PASSED\\n";
    return failed;
}`,
  },

  {
    id: "11-temperature",
    categoryIndex: 10,
    difficulty: "intermediate",
    title: "Temperature Literals with Conversions",
    description: `### Temperature Literals with Conversions

Create user-defined literals for temperature conversions.

**Requirements:**
- **Conversions:** Store temperature in Kelvin internally.
- **Literals:** Implement \`_K\`, \`_C\`, and \`_F\` literal operators.`,
    hints: [
      "Kelvin = Celsius + 273.15; Kelvin = (Fahrenheit - 32) * 5/9 + 273.15",
      "Round-trip: 0_C → Kelvin → back to Celsius should give ~0.0",
    ],
    starterCode: `#include <iostream>
#include <cmath>
using namespace std;

class Temperature {
private:
    double kelvin;
public:
    explicit Temperature(double kelvin);
    double toKelvin() const;
    double toCelsius() const;
    double toFahrenheit() const;
    friend ostream& operator<<(ostream& os, const Temperature& t);
};

Temperature operator""_K(long double k);
Temperature operator""_C(long double c);
Temperature operator""_F(long double f);
Temperature operator""_K(unsigned long long k);
Temperature operator""_C(unsigned long long c);
Temperature operator""_F(unsigned long long f);

// TODO: Implement Temperature and all literal operators.
// Conversions: C = K - 273.15; F = (K - 273.15) * 9/5 + 32
`,
    testHarness: `int main() {
    int failed = 0;
    auto EQ = [](double a, double b) { return fabs(a-b) < 0.01; };
    auto CHECK = [&](bool cond, const string& name) {
        cout << (cond ? "PASS" : "FAIL") << ": " << name << "\\n";
        if (!cond) failed++;
    };

    Temperature boiling = 100.0_C;
    CHECK(EQ(boiling.toKelvin(), 373.15), "100C = 373.15K");
    CHECK(EQ(boiling.toFahrenheit(), 212.0), "100C = 212F");

    Temperature freezing = 32.0_F;
    CHECK(EQ(freezing.toCelsius(), 0.0), "32F = 0C");
    CHECK(EQ(freezing.toKelvin(), 273.15), "32F = 273.15K");

    Temperature abs_zero = 0_K;
    CHECK(EQ(abs_zero.toCelsius(), -273.15), "0K = -273.15C");

    Temperature body = 37.0_C;
    CHECK(EQ(body.toFahrenheit(), 98.6), "37C = 98.6F");

    cout << "Boiling: " << boiling << "\\n"; // should show Kelvin

    if (failed == 0) cout << "ALL TESTS PASSED\\n";
    return failed;
}`,
  },

  {
    id: "11-duration",
    categoryIndex: 10,
    difficulty: "advanced",
    title: "Duration Literals — HH:MM:SS Formatter",
    description: `### Duration Literals

Design user-defined literals for time durations.

**Requirements:**
- **Formatting:** Format output as zero-padded \`HH:MM:SS\`.
- **Operators:** Overload arithmetic addition and user-defined suffixes \`_h\`, \`_min\`, and \`_s\`.`,
    hints: [
      "hours = totalSeconds / 3600; minutes = (totalSeconds % 3600) / 60; secs = totalSeconds % 60.",
      "Use std::setw(2) and std::setfill('0') in operator<< for zero-padding.",
    ],
    starterCode: `#include <iostream>
#include <iomanip>
using namespace std;

class Duration {
private:
    long long totalSeconds;
public:
    explicit Duration(long long seconds);
    Duration operator+(const Duration& other) const;
    bool operator==(const Duration& other) const;
    bool operator<(const Duration& other) const;
    long long getSeconds() const;
    friend ostream& operator<<(ostream& os, const Duration& d);
    // Format: HH:MM:SS (zero-padded, e.g., "01:30:45")
};

Duration operator""_h(unsigned long long h);
Duration operator""_min(unsigned long long m);
Duration operator""_s(unsigned long long s);

// TODO: Implement Duration class and all literal operators.
`,
    testHarness: `#include <sstream>
int main() {
    int failed = 0;
    auto CHECK = [&](bool cond, const string& name) {
        cout << (cond ? "PASS" : "FAIL") << ": " << name << "\\n";
        if (!cond) failed++;
    };

    Duration one_hour = 1_h;
    CHECK(one_hour.getSeconds() == 3600, "1 hour = 3600s");

    Duration half_hour = 30_min;
    CHECK(half_hour.getSeconds() == 1800, "30min = 1800s");

    Duration total = 1_h + 30_min + 45_s;
    CHECK(total.getSeconds() == 5445, "total seconds correct");

    ostringstream oss;
    oss << total;
    CHECK(oss.str() == "01:30:45", "formatted as 01:30:45");

    Duration zero = 0_s;
    ostringstream oss2; oss2 << zero;
    CHECK(oss2.str() == "00:00:00", "zero duration formats correctly");

    Duration day = 23_h + 59_min + 59_s;
    ostringstream oss3; oss3 << day;
    CHECK(oss3.str() == "23:59:59", "23:59:59 formats correctly");

    if (failed == 0) cout << "ALL TESTS PASSED\\n";
    return failed;
}`,
  },

  // ─── CATEGORY 12: Design Patterns ────────────────────────────────────────────

  {
    id: "12-observer",
    categoryIndex: 11,
    difficulty: "beginner",
    title: "Observer Pattern — Stock Ticker",
    description: `### Observer Pattern — Stock Ticker

Implement the Observer design pattern.

**Requirements:**
- **Interfaces:** Define \`IObserver\` and \`ISubject\`.
- **Classes:** Implement \`StockTicker\` notifying attached observers of stock price updates.`,
    hints: [
      "Store observers in a vector<IObserver*>. detach() erases the matching pointer.",
      "notify() iterates observers and calls update() on each.",
    ],
    starterCode: `#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
using namespace std;

class IObserver {
public:
    virtual ~IObserver() = default;
    virtual void update(const string& event, double value) = 0;
};

class ISubject {
protected:
    vector<IObserver*> observers;
public:
    virtual ~ISubject() = default;
    void attach(IObserver* obs);
    void detach(IObserver* obs);
protected:
    void notify(const string& event, double value);
};

class StockTicker : public ISubject {
    string symbol;
    double price;
public:
    StockTicker(const string& symbol, double initialPrice);
    void setPrice(double newPrice);
    double getPrice() const;
    const string& getSymbol() const;
};

class PriceAlert : public IObserver {
    string name;
    double threshold;
    int alertCount;
public:
    PriceAlert(const string& name, double threshold);
    void update(const string& event, double value) override;
    // Print if value > threshold: "ALERT [name]: price X exceeds threshold T"
    int getAlertCount() const;
};

class PriceLogger : public IObserver {
    vector<pair<string, double>> log;
public:
    void update(const string& event, double value) override;
    int getLogCount() const;
    void printLog() const;
};

// TODO: Implement ISubject methods and all classes.
`,
    testHarness: `int main() {
    int failed = 0;
    auto CHECK = [&](bool cond, const string& name) {
        cout << (cond ? "PASS" : "FAIL") << ": " << name << "\\n";
        if (!cond) failed++;
    };

    StockTicker ticker("AAPL", 150.0);
    PriceAlert alert("High Alert", 180.0);
    PriceLogger logger;

    ticker.attach(&alert);
    ticker.attach(&logger);

    ticker.setPrice(170.0);
    ticker.setPrice(185.0);
    ticker.setPrice(190.0);

    CHECK(logger.getLogCount() == 3, "logger received 3 updates");
    CHECK(alert.getAlertCount() == 2, "alert triggered 2 times (185, 190 > 180)");

    ticker.detach(&alert);
    ticker.setPrice(200.0);
    CHECK(logger.getLogCount() == 4, "logger still gets 4th update");
    CHECK(alert.getAlertCount() == 2, "alert NOT triggered after detach");

    logger.printLog();

    if (failed == 0) cout << "ALL TESTS PASSED\\n";
    return failed;
}`,
  },

  {
    id: "12-json-tree",
    categoryIndex: 11,
    difficulty: "intermediate",
    title: "JSON Value Tree — Composite Pattern",
    description: `### JSON Value Tree — Composite Pattern

Create a composite JSON tree structure.

**Requirements:**
- **Nodes:** Define a base \`JSONNode\` with derived types representing scalars (numbers, strings) and collections (arrays, objects).`,
    hints: [
      "JSONNumber stores a double. Print with std::to_string or iomanip.",
      "JSONString wraps a std::string; print with quotes.",
      "JSONArray::print(): '[' then each child separated by ', ' then ']'",
    ],
    starterCode: `#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <memory>
using namespace std;

class JSONNode {
public:
    virtual ~JSONNode() = default;
    virtual void print(ostream& os) const = 0;
};

ostream& operator<<(ostream& os, const JSONNode& n) { n.print(os); return os; }

class JSONNull : public JSONNode {
public:
    void print(ostream& os) const override; // prints "null"
};

class JSONBool : public JSONNode {
    bool val;
public:
    explicit JSONBool(bool v);
    void print(ostream& os) const override; // prints "true" or "false"
};

class JSONNumber : public JSONNode {
    double val;
public:
    explicit JSONNumber(double v);
    void print(ostream& os) const override; // prints the number
};

class JSONString : public JSONNode {
    string val;
public:
    explicit JSONString(string v);
    void print(ostream& os) const override; // prints "value" (with quotes)
};

class JSONArray : public JSONNode {
    vector<unique_ptr<JSONNode>> items;
public:
    void add(unique_ptr<JSONNode> node);
    void print(ostream& os) const override; // [item, item, ...]
};

class JSONObject : public JSONNode {
    map<string, unique_ptr<JSONNode>> fields;
public:
    void set(const string& key, unique_ptr<JSONNode> node);
    void print(ostream& os) const override; // {"key": val, ...}
};

// TODO: Implement all node types.
`,
    testHarness: `int main() {
    int failed = 0;
    auto CHECK = [&](bool cond, const string& name) {
        cout << (cond ? "PASS" : "FAIL") << ": " << name << "\\n";
        if (!cond) failed++;
    };

    // Build: {"name": "Alice", "age": 30, "active": true, "scores": [95, 87, 92]}
    JSONObject obj;
    obj.set("name",   make_unique<JSONString>("Alice"));
    obj.set("age",    make_unique<JSONNumber>(30));
    obj.set("active", make_unique<JSONBool>(true));

    auto arr = make_unique<JSONArray>();
    arr->add(make_unique<JSONNumber>(95));
    arr->add(make_unique<JSONNumber>(87));
    arr->add(make_unique<JSONNumber>(92));
    obj.set("scores", move(arr));

    // Print and check output contains expected substrings
    ostringstream oss;
    obj.print(oss);
    string s = oss.str();

    CHECK(s.find("\"Alice\"") != string::npos, "name Alice present");
    CHECK(s.find("\"active\"") != string::npos, "active key present");
    CHECK(s.find("true") != string::npos, "boolean true present");
    CHECK(s.find("95") != string::npos, "score 95 present");

    JSONNull n; ostringstream ns; n.print(ns);
    CHECK(ns.str() == "null", "null prints null");

    cout << "Tree:\\n" << obj << "\\n";

    if (failed == 0) cout << "ALL TESTS PASSED\\n";
    return failed;
}`,
  },

  {
    id: "12-command-undo",
    categoryIndex: 11,
    difficulty: "advanced",
    title: "Command Pattern with Undo/Redo",
    description: `### Command Pattern with Undo/Redo

Implement the Command design pattern with history stack tracking.

**Requirements:**
- **Commands:** Define \`ICommand\` with \`execute()\` and \`undo()\` actions.
- **History:** Keep track of executed commands to allow undo and redo operations.`,
    hints: [
      "CommandHistory holds two stacks: 'done' and 'undone'. execute() pushes to done and clears undone.",
      "InsertCommand::undo() removes the inserted text at the same position.",
      "Store the full or partial text state in the command for reliable undo.",
    ],
    starterCode: `#include <iostream>
#include <string>
#include <vector>
#include <memory>
#include <stdexcept>
using namespace std;

class TextEditor {
    string content;
public:
    TextEditor() = default;
    void insert(int pos, const string& text);
    void remove(int pos, int len);
    const string& getContent() const;
};

class ICommand {
public:
    virtual ~ICommand() = default;
    virtual void execute(TextEditor& editor) = 0;
    virtual void undo(TextEditor& editor) = 0;
    virtual string describe() const = 0;
};

class InsertCommand : public ICommand {
    int pos;
    string text;
public:
    InsertCommand(int pos, const string& text);
    void execute(TextEditor& editor) override;
    void undo(TextEditor& editor) override;
    string describe() const override;
};

class DeleteCommand : public ICommand {
    int pos, len;
    string deleted; // saved during execute for undo
public:
    DeleteCommand(int pos, int len);
    void execute(TextEditor& editor) override;
    void undo(TextEditor& editor) override;
    string describe() const override;
};

class CommandHistory {
    vector<unique_ptr<ICommand>> done;
    vector<unique_ptr<ICommand>> undone;
public:
    void execute(unique_ptr<ICommand> cmd, TextEditor& editor);
    bool undo(TextEditor& editor);   // returns false if nothing to undo
    bool redo(TextEditor& editor);   // returns false if nothing to redo
    int doneCount() const;
    int undoneCount() const;
};

// TODO: Implement TextEditor, both commands, and CommandHistory.
// DeleteCommand::execute() must save the deleted text for undo.
`,
    testHarness: `int main() {
    int failed = 0;
    auto CHECK = [&](bool cond, const string& name) {
        cout << (cond ? "PASS" : "FAIL") << ": " << name << "\\n";
        if (!cond) failed++;
    };

    TextEditor ed;
    CommandHistory history;

    history.execute(make_unique<InsertCommand>(0, "Hello"), ed);
    history.execute(make_unique<InsertCommand>(5, " World"), ed);
    history.execute(make_unique<InsertCommand>(11, "!"), ed);
    CHECK(ed.getContent() == "Hello World!", "after 3 inserts");
    CHECK(history.doneCount() == 3, "history has 3 commands");

    history.undo(ed);
    CHECK(ed.getContent() == "Hello World", "after 1 undo");
    history.undo(ed);
    CHECK(ed.getContent() == "Hello", "after 2 undos");
    CHECK(history.undoneCount() == 2, "2 commands undone");

    history.redo(ed);
    CHECK(ed.getContent() == "Hello World", "after 1 redo");
    CHECK(history.doneCount() == 2, "done count back to 2");

    // Test delete
    history.execute(make_unique<DeleteCommand>(5, 6), ed);
    CHECK(ed.getContent() == "Hello", "after delete ' World'");
    history.undo(ed);
    CHECK(ed.getContent() == "Hello World", "delete undone");

    bool noMore = !history.redo(ed);
    // redo after new command clears redo stack
    history.execute(make_unique<InsertCommand>(0, "!"), ed);
    bool cannotRedo = !history.redo(ed);
    CHECK(cannotRedo, "redo returns false when stack empty after new cmd");

    if (failed == 0) cout << "ALL TESTS PASSED\\n";
    return failed;
}`,
  },
];

export function getExerciseById(id: string): Exercise | undefined {
  return EXERCISES.find((e) => e.id === id);
}

export function getExercisesByCategory(categoryIndex: number): Exercise[] {
  return EXERCISES.filter((e) => e.categoryIndex === categoryIndex);
}
