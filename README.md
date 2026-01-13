# JSON / Form Helper (Angular)

A lightweight, **100% client-side** web tool built with **Angular** to help developers work with JSON faster and more comfortably.

---

## ✨ Features

- ✅ JSON editor with real-time editing
- ✅ Validate JSON with clear error messages
- ✅ Tree view JSON explorer with expand/collapse
- ✅ Copy key path (`a.b.c`) & values
- ✅ Dark / Light mode with system preference detection
- ✅ Form generator with dynamic field generation
- ✅ Beautify / Minify JSON
- ✅ Local history using `localStorage`
- ✅ Import / Export JSON files
- ✅ JSON Diff comparison tool
- ✅ PWA support (offline capability, installable)
- ✅ Search & filter in JSON tree
- ✅ Export to various formats (YAML, CSV, XML, TOML)
- ✅ JSON schema validation

No backend. No server. Just pure frontend.

---

## 🛠 Tech Stack

- **Angular (Standalone Components)**
- TypeScript (strict mode)
- Tailwind CSS
- Browser APIs (Clipboard, localStorage)

---

## 📸 Screenshots

> _(Add screenshots / GIF here)_

---

## 🚀 Getting Started

```bash
npm install
npm start

or

yarn
yarn start
```

Open `http://localhost:4200`

---

## 📖 How to Use

### Beautify / Minify JSON

The JSON editor includes built-in beautify and minify functionality.

**Beautify JSON:**

- Formats JSON with proper indentation (2 spaces)
- Makes JSON more readable
- Click the **✨ Beautify** button in the JSON Input editor
- Only works with valid JSON

**Minify JSON:**

- Removes all unnecessary whitespace
- Reduces file size
- Click the **📦 Minify** button in the JSON Input editor
- Only works with valid JSON

**Note:** Both buttons are disabled when JSON is invalid or empty. Error messages are displayed if beautify/minify fails.

### Local History

The JSON editor automatically saves your valid JSON entries to browser localStorage for quick access later.

**Features:**

- **Auto-save**: Valid JSON is automatically saved to history after 2 seconds of inactivity
- **View History**: Click the **📚 History** button to view all saved JSON entries
- **Load from History**: Click **Load** on any history item to restore it to the editor
- **Delete Items**: Click **✕** to remove individual items from history
- **Clear All**: Click **Clear All** to remove all history items
- **Smart Preview**: Each history item shows a preview (first 100 characters) and relative timestamp
- **Duplicate Prevention**: Duplicate JSON entries update the timestamp instead of creating duplicates
- **Storage Limit**: History is limited to 50 items to prevent localStorage overflow

**Note:** History is stored locally in your browser and persists across sessions. It's only accessible on the same browser/device.

### Import / Export JSON Files

The JSON editor supports importing and exporting JSON files directly from your computer.

**Import JSON:**

- Click the **📥 Import** button to select a JSON file from your computer
- The file will be validated and automatically beautified on import
- Invalid JSON files will show an error message
- Imported JSON is automatically saved to history

**Export JSON:**

- Click the **📤 Export** button to download the current JSON as a `.json` file
- The exported file is automatically beautified (formatted with indentation)
- File name format: `json-export-YYYY-MM-DD.json`
- Button is disabled when JSON is invalid or empty

**Supported File Types:**

- `.json` files
- `application/json` MIME type

**Note:** All file operations are handled client-side. No data is sent to any server.

### JSON Diff Comparison

Compare two JSON objects side-by-side to see what changed, added, or removed.

**How to Use:**

1. Click the **🔍 Diff** button in the header (or navigate to `/diff`) to open the JSON Diff tool
2. Enter your first JSON in the **JSON A (Old)** textarea
3. Enter your second JSON in the **JSON B (New)** textarea
4. Differences are automatically calculated and displayed below

**Diff Types:**

- **🟢 Added** (Green): Keys/values that exist in JSON B but not in JSON A
- **🔴 Removed** (Red): Keys/values that exist in JSON A but not in JSON B
- **🟡 Changed** (Yellow): Keys that exist in both but have different values

**Features:**

- **Real-time comparison**: Differences are calculated automatically as you type
- **Path display**: Shows the full path to each difference (e.g., `user.address.city`)
- **Value preview**: Displays old and new values for changed items
- **Swap JSON**: Click **🔄 Swap** to exchange JSON A and JSON B
- **Clear All**: Click **🗑️ Clear** to reset both JSON inputs
- **Validation**: Shows error messages for invalid JSON in each textarea

**Note:** The diff tool supports nested objects and arrays. It compares structure and values recursively.

### PWA Support (Progressive Web App)

The app can be installed as a Progressive Web App (PWA) for offline use and quick access.

**Features:**

- **Installable**: Click the install prompt to add the app to your home screen
- **Offline Support**: Works offline after first visit (all features available)
- **Auto Updates**: Automatically checks for updates and notifies you
- **Fast Loading**: Cached resources load instantly
- **App-like Experience**: Runs in standalone mode when installed

**How to Install:**

1. Visit the app in a supported browser (Chrome, Edge, Safari)
2. Look for the install prompt (appears after a few seconds)
3. Click **Install** to add to home screen
4. Or use browser menu: Chrome/Edge → "Install app" or Safari → "Add to Home Screen"

**Offline Mode:**

- All features work offline after initial visit
- JSON history and localStorage data persist offline
- Service worker caches app resources automatically
- Offline indicator appears when connection is lost

**Update Notifications:**

- App automatically checks for updates every minute
- Update notification appears when new version is available
- Click **Reload** to update to the latest version

**Note:** PWA features are only enabled in production builds. Service worker is disabled in development mode.

### Search & Filter in JSON Tree

The JSON Viewer includes powerful search and filter capabilities to quickly find specific keys or values in large JSON structures.

**Search Features:**

- **Real-time search**: Type in the search box to filter nodes instantly
- **Search in keys**: Finds matches in property names
- **Search in values**: Finds matches in property values
- **Search in paths**: Finds matches in full paths (e.g., `user.address.city`)
- **Highlight matches**: Matching text is highlighted with yellow background
- **Auto-expand**: Parent nodes automatically expand when children match search
- **Result counter**: Shows "X/Y" results found

**Filter by Type:**

- **String**: Filter to show only string values (green)
- **Number**: Filter to show only number values (purple)
- **Boolean**: Filter to show only boolean values (orange)
- **Object**: Filter to show only object nodes (blue)
- **Array**: Filter to show only array nodes (blue)
- **Multiple selection**: Can select multiple types at once

**How to Use:**

1. Enter search text in the search box to filter by content
2. Check type checkboxes to filter by data type
3. Click **✕ Clear** to reset all filters
4. Matching text is automatically highlighted in yellow
5. Parent nodes auto-expand to show matching children

**Note:** Search is case-insensitive and searches recursively through nested objects and arrays.

### Export to Various Formats

The JSON Editor supports exporting JSON data to multiple formats for compatibility with different tools and systems.

**Supported Formats:**

- **JSON**: Standard JSON format (beautified)
- **YAML**: YAML format for configuration files
- **CSV**: Comma-separated values for spreadsheet applications
- **XML**: Extensible Markup Language format
- **TOML**: TOML format for configuration files

**How to Use:**

1. Enter or load valid JSON in the editor
2. Click the **📤 Export** button (dropdown menu will appear)
3. Select desired format (JSON, YAML, CSV, XML, or TOML)
4. File will be automatically downloaded with appropriate extension

**Format Details:**

- **JSON**: Beautified with 2-space indentation
- **YAML**: Properly formatted with correct indentation and escaping
- **CSV**: Converts arrays of objects to CSV rows (first object's keys become headers)
- **XML**: Converts JSON structure to XML with proper escaping
- **TOML**: Converts JSON to TOML format with table syntax for nested objects

**Note:** Complex nested structures may have limitations in certain formats (e.g., CSV works best with arrays of flat objects).

### JSON Schema Validation

Validate JSON data against JSON Schema to ensure it conforms to a specific structure and constraints.

**Features:**

- **Real-time validation**: Validation runs automatically as you type
- **Detailed error messages**: Shows exact path and reason for each validation error
- **Schema validation**: Validates the schema itself before validating data
- **Example templates**: Load example schema and data to get started quickly
- **Multiple constraints**: Supports type, required, min/max, pattern, format, enum, and more

**Supported Schema Features:**

- **Types**: string, number, integer, boolean, null, object, array
- **Object validation**: properties, required, additionalProperties
- **Array validation**: items, minItems, maxItems
- **String constraints**: minLength, maxLength, pattern, format (email, uri, date, date-time, ipv4, ipv6)
- **Number constraints**: minimum, maximum, exclusiveMinimum, exclusiveMaximum, multipleOf
- **Enum and const**: Validate against specific values
- **Nested structures**: Full support for nested objects and arrays

**How to Use:**

1. Navigate to **📋 Schema** in the header (or go to `/schema`)
2. Enter your **JSON Schema** in the left editor
3. Enter your **JSON Data** in the right editor
4. Validation results appear automatically below
5. Click **📝 Load Example Schema** or **📄 Load Example Data** for quick start
6. Click **🗑️ Clear All** to reset both editors

**Example Schema:**

```json
{
  "type": "object",
  "properties": {
    "name": {
      "type": "string",
      "minLength": 1
    },
    "email": {
      "type": "string",
      "format": "email"
    },
    "age": {
      "type": "number",
      "minimum": 0,
      "maximum": 150
    }
  },
  "required": ["name", "email"]
}
```

**Validation Errors:**

- Shows the JSON path where the error occurred (e.g., `/name`)
- Displays a clear error message explaining what's wrong
- Indicates which schema constraint failed (e.g., `/required`, `/minLength`)

**Note:** This implementation supports core JSON Schema features. For advanced features like `$ref`, `allOf`, `anyOf`, `oneOf`, consider using a full JSON Schema validator library like Ajv.

### Form Generator

The Form Generator automatically creates an interactive form from your JSON object structure.

**Steps:**

1. **Enter a JSON object** in the JSON Input editor (must be a valid object, not an array or primitive)

   Example:

   ```json
   {
     "name": "John Doe",
     "age": 30,
     "email": "john@example.com",
     "isActive": true,
     "tags": ["developer", "angular"],
     "address": {
       "street": "123 Main St",
       "city": "New York"
     }
   }
   ```

2. **Form fields are automatically generated** based on the JSON structure:

   - `string` → Text input
   - `number` → Number input
   - `boolean` → Checkbox
   - `array` → Textarea (enter as JSON array)
   - `object` → Textarea (enter as JSON object)

3. **Fill in the form** with your desired values

4. **Click Submit** to see the result as JSON

5. **Click Reset** to restore original values

6. **Click Copy** to copy the result to clipboard

**Supported Field Types:**

- ✅ String fields (text input)
- ✅ Number fields (number input)
- ✅ Boolean fields (checkbox)
- ✅ Array fields (JSON textarea)
- ✅ Object fields (JSON textarea)

**Note:** Currently supports flat objects only. Nested objects and arrays are displayed as JSON textareas for manual editing.

---

## 📁 Project Structure

```
src/
 ├─ app/
 │   ├─ core/
 │   │   └─ services/
 │   ├─ features/
 │   │   ├─ home/
 │   │   ├─ json-editor/
 │   │   ├─ json-viewer/
 │   │   ├─ form-generator/
 │   │   └─ json-diff/
 │   ├─ shared/
 │   └─ app.component.ts
 └─ styles/
```

## 🧭 Navigation

- **Home** (`/`): Main page with JSON editor, viewer, and form generator
- **Diff** (`/diff`): JSON comparison tool
- **Schema** (`/schema`): JSON Schema validation tool

---

## 🗺 Roadmap

### ✅ Completed

- [x] JSON editor with real-time input
- [x] JSON validation with error messages
- [x] Tree view JSON explorer
- [x] Copy key path functionality
- [x] Dark / Light mode toggle
- [x] Form generator with dynamic field generation
- [x] Beautify / Minify JSON
- [x] Local history using `localStorage`
- [x] Import / Export JSON files
- [x] JSON Diff comparison tool
- [x] PWA support (offline capability, installable)
- [x] Search & filter in JSON tree
- [x] Export to various formats (YAML, CSV, XML, TOML)
- [x] JSON schema validation

### 📋 Planned

_All planned features have been completed! 🎉_

---

## 🧪 Development Checklist (Daily Review)

- [ ] No TypeScript `any`
- [ ] Components < 300 lines
- [ ] Services are reusable
- [ ] UI works on mobile
- [ ] No console errors

---

## 🤝 Contributing

PRs and ideas are welcome.

---

## 📄 License

MIT

---

## 💡 Notes

This project is designed as a **portfolio-ready** example focusing on:

- Clean Angular architecture
- Developer Experience (DX)
- Maintainability & extensibility

---

## 🚀 Development with Cursor

This project was developed using **Cursor** - an AI-powered code editor that enhances productivity through intelligent code completion, refactoring, and assistance.

**Key Features Used:**

- **AI Pair Programming**: Leveraged Cursor's AI capabilities for rapid feature development
- **Code Generation**: Used AI assistance for implementing complex features like JSON Schema validation, export formats, and PWA support
- **Refactoring**: AI-assisted code refactoring for better maintainability and separation of concerns
- **Error Resolution**: Quick identification and fixing of TypeScript errors, runtime issues, and Angular signal violations

**Development Workflow:**

1. Feature planning and architecture design
2. AI-assisted implementation with Cursor
3. Code review and refinement
4. Testing and bug fixes
5. Documentation updates

This project demonstrates how modern AI tools like Cursor can accelerate development while maintaining code quality and best practices.

---

## 🎯 VibeCode Project

This is a **VibeCode** project - showcasing modern web development practices with AI-assisted development tools.

**What is VibeCode?**

VibeCode represents a new approach to software development where developers leverage AI-powered tools to:

- Build faster without sacrificing quality
- Focus on architecture and user experience
- Learn and adapt quickly to new technologies
- Create maintainable, production-ready code

**Project Highlights:**

- ✅ 100% client-side application (no backend required)
- ✅ Modern Angular with Standalone Components
- ✅ Full TypeScript strict mode compliance
- ✅ PWA-ready with offline support
- ✅ Comprehensive feature set for JSON manipulation
- ✅ Clean, maintainable codebase
- ✅ AI-assisted development workflow
