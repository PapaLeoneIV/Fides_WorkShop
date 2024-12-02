# Naming Conventions

This document outlines naming conventions for consistent and readable code. Following these conventions will improve clarity and maintainability across the codebase.

## General Principles
- **Clarity**: Names should clearly describe the purpose of the variable, method, or class.
- **Consistency**: Follow the conventions for the appropriate language or framework.
- **Avoid Abbreviations**: Use complete words unless it’s widely understood (e.g., `URL` instead of `UniformResourceLocator`).
- **Case Sensitivity**: Use cases that are conventional for the type of identifier, as detailed below.

---

### 1. Classes and Interfaces
- **Naming Convention**: PascalCase (each word capitalized)
- **Examples**: `UserRepository`, `OrderService`, `BikeManager`
- **Notes**: Class names should be nouns describing their role. Interface names should describe behavior (e.g., `IBikeService` for TypeScript or simply `BikeService`).

### 2. Methods and Functions
- **Naming Convention**: camelCase (lowercase first word, then capitalize subsequent words)
- **Examples**: `getUserData()`, `calculateTotalPrice()`, `incrementBikeCount()`
- **Notes**: Method names should be descriptive verbs or verb phrases that explain what the method does. Avoid single-character or non-descriptive names.

### 3. Variables and Properties
- **Naming Convention**: camelCase
- **Examples**: `userName`, `totalAmount`, `isAvailable`
- **Notes**: Variables and properties should have clear, concise names that describe their purpose or data type. Use descriptive names even for temporary or loop variables (e.g., `index` or `counter` instead of `i` or `j`).

### 4. Constants
- **Naming Convention**: UPPER_CASE with underscores
- **Examples**: `MAX_RETRIES`, `DEFAULT_TIMEOUT`, `API_KEY`
- **Notes**: Constants should have names that clearly describe their purpose and are defined at the top of the module or within a dedicated file.

### 5. Environment Variables
- **Naming Convention**: UPPER_CASE with underscores
- **Examples**: `DB_HOST`, `PORT`, `NODE_ENV`
- **Notes**: Environment variables are usually managed by `.env` files and should be named according to the configuration they represent, often prefixed with a specific context if needed (e.g., `AUTH_SERVICE_URL`).

### 6. Enums
- **Naming Convention**: PascalCase for the Enum name and UPPER_CASE for its values
- **Examples**:
  ```typescript
  enum BikeType {
    ROAD_BIKE = "road",
    DIRT_BIKE = "dirt",
    ELECTRIC_BIKE = "electric",
  }
  ```
- **Notes**: Enum names should be singular and represent the category. Enum values should be written in uppercase to signify constant values.

### 7. Files and Folders
- **Naming Convention**: If the file contains a single class, object, or function, use the case of the content (PascalCase or camelCase) else if the file contains multiple classes, objects, or functions, use kebab-case (all lowercase, words separated by hyphens) 
- **Examples**: `bike-repository.ts`, `order-service.js`, `user-controller.ts`
- **Notes**: Filenames should clearly represent the content or purpose of the file. Folder names should describe their contents (e.g., `controllers`, `services`, `repositories`).

### 8. Database Columns and Tables
- **Naming Convention**: snake_case (all lowercase, words separated by underscores)
- **Examples**: `user_id`, `order_total`, `created_at`
- **Notes**: Column names should be descriptive but concise, and they should avoid using reserved words.

### 9. TypeScript Types and Interfaces
- **Naming Convention**: PascalCase, with types prefixed as `I` or descriptive (optional)
- **Examples**: `User`, `IBikeService`, `OrderPayload`
- **Notes**: Interfaces often start with `I`, but it’s optional and should be decided as a team convention. Keep types descriptive of the object they represent.

### 10. Test Files
- **Naming Convention**: Use the suffix `.test` or `.spec` before the file extension
- **Examples**: `bike-repository.test.ts`, `order-service.spec.js`
- **Notes**: Keep test file names aligned with the files they test to easily locate them.

### Example Summary Table

| Type                  | Naming Convention         | Examples                       |
|-----------------------|---------------------------|--------------------------------|
| **Classes**           | PascalCase                | `OrderService`, `BikeManager`  |
| **Methods**           | camelCase                 | `getUserData()`, `incrementBikeCount()` |
| **Variables**         | camelCase                 | `userName`, `totalAmount`      |
| **Constants**         | UPPER_CASE                | `MAX_RETRIES`, `API_KEY`       |
| **Environment Vars**  | UPPER_CASE                | `DB_HOST`, `NODE_ENV`          |
| **Enums**             | PascalCase (name), UPPER_CASE (values) | `BikeType`, `ROAD_BIKE` |
| **Files/Folders**     | content case or kebab-case | `bike-repository.ts`, `user-controller.ts` |
| **Database Columns**  | snake_case                | `user_id`, `created_at`        |
| **TS Interfaces**     | PascalCase (optional `I`) | `IUser`, `OrderPayload`        |
| **Test Files**        | `.test` or `.spec` suffix | `order-service.test.js`        |

---
