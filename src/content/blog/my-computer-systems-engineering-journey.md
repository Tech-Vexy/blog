---
title: 'My Journey as a Computer Systems Engineering Student: Lessons Learned'
cover: '../../assets/blog-placeholder-1.jpg'
coverAlt: 'Computer Systems Engineering student journey and learning experiences'
description: 'Reflections on my journey as a Computer Systems Engineering student at Kirinyaga University - challenges, growth, and key learnings'
pubDate: 2025-01-15
heroImage: '../../assets/blog-placeholder-1.jpg'
---

As a Computer Systems Engineering student at Kirinyaga University, my journey into the world of technology has been both challenging and incredibly rewarding. I wanted to share some insights and lessons I've learned along the way, hoping they might help other students or aspiring developers on their own paths.

## Starting the Journey

When I first started my Computer Systems Engineering program, I had a basic understanding of programming and a strong curiosity about how technology works. What I didn't anticipate was how much the field would push me to think differently about problem-solving and system design.

### Early Challenges

The transition from basic programming to understanding complex systems wasn't immediate. Some of the biggest challenges I faced included:

- **Understanding System Architecture**: Moving from writing simple programs to understanding how entire systems work together
- **Mathematical Foundations**: Grasping the mathematical concepts underlying computer systems
- **Programming Language Diversity**: Learning multiple languages and understanding when to use each one
- **Time Management**: Balancing coursework, personal projects, and skill development

## Key Learning Areas

### 1. Programming Fundamentals

Starting with **C programming** gave me a solid foundation in understanding how computers work at a low level. Learning about:

```c
// Memory management concepts that shaped my understanding
#include <stdio.h>
#include <stdlib.h>

int* createArray(int size) {
    int* arr = (int*)malloc(size * sizeof(int));
    if (arr == NULL) {
        printf("Memory allocation failed!\n");
        return NULL;
    }
    return arr;
}

void freeArray(int* arr) {
    free(arr);
}
```

Understanding pointers, memory management, and low-level operations in C has been invaluable for all my subsequent programming endeavors.

### 2. Python for AI/ML

My passion for **Artificial Intelligence and Machine Learning** led me to dive deep into Python:

```python
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression

# Simple example that sparked my interest in ML
def predict_student_performance(study_hours, previous_grades):
    # This kind of problem-solving excited me
    X = np.array(study_hours).reshape(-1, 1)
    y = np.array(previous_grades)
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
    
    model = LinearRegression()
    model.fit(X_train, y_train)
    
    return model.predict(X_test)
```

### 3. Web Development Skills

Learning **JavaScript, HTML5, and CSS3** opened up a new world of possibilities:

```javascript
// My first interactive web application
class StudentGradeTracker {
    constructor() {
        this.grades = [];
    }
    
    addGrade(subject, grade) {
        this.grades.push({ subject, grade, date: new Date() });
        this.updateDisplay();
    }
    
    calculateGPA() {
        const total = this.grades.reduce((sum, g) => sum + g.grade, 0);
        return (total / this.grades.length).toFixed(2);
    }
    
    updateDisplay() {
        document.getElementById('gpa').textContent = this.calculateGPA();
    }
}
```

## Personal Growth and Development

### Building a Learning Mindset

One of the most important lessons has been developing a **continuous learning mindset**. Technology evolves rapidly, and staying current requires constant adaptation. I've learned to:

- **Embrace challenges** as learning opportunities
- **Ask questions** without fear of seeming uninformed
- **Practice consistently** rather than cramming before exams
- **Build projects** to apply theoretical knowledge

### Contributing to Open Source

Getting involved in open-source projects has been transformational. My contributions to various repositories have taught me:

- **Code collaboration** using Git and GitHub
- **Code review processes** and quality standards
- **Documentation importance** for project sustainability
- **Community engagement** and professional networking

### Virtual Internships and Real-World Experience

Completing the **JPMorgan Chase Software Engineering virtual experience** program was eye-opening. It showed me how academic knowledge translates to real-world applications:

```python
# Example from JPMC task - processing financial data
import pandas as pd

def process_stock_data(data_feed):
    """
    Process real-time stock data feed
    Learning: How financial institutions handle data at scale
    """
    df = pd.DataFrame(data_feed)
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    df['price_change'] = df['price'].pct_change()
    
    # Calculate moving averages for trend analysis
    df['ma_5'] = df['price'].rolling(window=5).mean()
    df['ma_20'] = df['price'].rolling(window=20).mean()
    
    return df
```

## Current Projects and Focus Areas

### 1. Number Converter Tool

My **TypeScript-based Number Converter** project taught me about:

```typescript
// Type safety and better code organization
interface NumberBase {
    value: string;
    base: number;
}

class NumberConverter {
    static convert(input: NumberBase, targetBase: number): string {
        const decimal = parseInt(input.value, input.base);
        return decimal.toString(targetBase).toUpperCase();
    }
    
    static validateInput(value: string, base: number): boolean {
        const validChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.slice(0, base);
        return value.split('').every(char => validChars.includes(char.toUpperCase()));
    }
}
```

### 2. AI/ML Exploration

Currently working on understanding **machine learning algorithms** from the ground up:

```python
# Implementing basic algorithms to understand their mechanics
class SimplePerceptron:
    def __init__(self, learning_rate=0.01, epochs=100):
        self.learning_rate = learning_rate
        self.epochs = epochs
        self.weights = None
        self.bias = None
    
    def fit(self, X, y):
        # Initialize weights and bias
        self.weights = np.zeros(X.shape[1])
        self.bias = 0
        
        # Training loop
        for epoch in range(self.epochs):
            for i in range(X.shape[0]):
                # Forward pass
                prediction = self.predict_single(X[i])
                
                # Update weights if prediction is wrong
                if prediction != y[i]:
                    self.weights += self.learning_rate * y[i] * X[i]
                    self.bias += self.learning_rate * y[i]
    
    def predict_single(self, x):
        return 1 if np.dot(x, self.weights) + self.bias > 0 else 0
```

## Lessons for Future Students

### 1. Don't Fear the Math

Initially, I was intimidated by the mathematical foundations of computer science. However, I learned that:

- **Mathematics provides the logic** behind efficient algorithms
- **Statistics is crucial** for data science and AI/ML
- **Linear algebra** is fundamental for graphics and machine learning
- **Discrete mathematics** helps with algorithm analysis

### 2. Build While You Learn

Theory is important, but **practical application** solidifies understanding:

```javascript
// Simple example: Building a task manager to learn state management
class TaskManager {
    constructor() {
        this.tasks = [];
        this.nextId = 1;
    }
    
    addTask(description, priority = 'medium') {
        const task = {
            id: this.nextId++,
            description,
            priority,
            completed: false,
            createdAt: new Date()
        };
        this.tasks.push(task);
        return task;
    }
    
    completeTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = true;
            task.completedAt = new Date();
        }
    }
    
    getTasks(filter = 'all') {
        switch(filter) {
            case 'completed':
                return this.tasks.filter(t => t.completed);
            case 'pending':
                return this.tasks.filter(t => !t.completed);
            default:
                return this.tasks;
        }
    }
}
```

### 3. Network and Collaborate

The tech community is incredibly supportive. I've found that:

- **GitHub contributions** open doors to collaboration
- **Social media engagement** (LinkedIn, Twitter) builds professional networks
- **University communities** provide peer support and study groups
- **Online forums** offer help when you're stuck

### 4. Document Your Journey

Keeping track of what you learn helps with:

- **Interview preparation** - you can discuss real projects
- **Portfolio building** - showcasing growth over time
- **Problem-solving reference** - revisiting solutions to similar problems
- **Motivation** - seeing how far you've come

## Looking Forward

As I continue my studies and prepare for a career in technology, I'm excited about:

### Short-term Goals

- **Completing my degree** with strong foundations in systems engineering
- **Building more complex projects** that solve real-world problems
- **Contributing to open-source** projects more regularly
- **Learning new technologies** like Docker, Kubernetes, and cloud platforms

### Long-term Vision

- **Specializing in AI/ML** applications for social good
- **Building scalable systems** that can handle millions of users
- **Mentoring other students** who are starting their tech journey
- **Contributing to technological advancement** in Kenya and beyond

## Final Thoughts

The journey of a Computer Systems Engineering student is challenging but incredibly rewarding. Every problem solved, every concept understood, and every project completed builds not just technical skills but also confidence and problem-solving ability.

To fellow students: **embrace the challenges**, **celebrate small wins**, and remember that everyone starts somewhere. The key is consistent effort and a willingness to learn from both successes and failures.

To potential collaborators: I'm always excited to work on projects involving **Python applications**, **web development**, **AI/ML exploration**, or any innovative idea that could make a positive impact. Let's build something amazing together!

---

*This post reflects my ongoing journey as a Computer Systems Engineering student. I'd love to hear about your experiences and connect with fellow developers and students. You can reach me on [GitHub](https://github.com/Tech-Vexy), [LinkedIn](https://www.linkedin.com/in/veldrineevelia), or [Twitter](https://x.com/EVeldrine).*
