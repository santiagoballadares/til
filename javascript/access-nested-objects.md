# Access nested objects with vanilla JavaScript
Neat ways to access nested objects with vanilla JavaScript.

#### Object
```javascript
const dataObj = {
  level1: {
    level2: {
      level3: {
        value: 1234567890,
      },
    },
  },
};
const value3 = dataObj.level1.level2.level3.value;      // 1234567890
const value3_2 = dataObj.level1.level2.level3_2.value;  // error
```

#### Array reduce
```javascript
const levels = ['level1', 'level2', 'level3', 'value'];
const value = levels.reduce((obj, level) => {
  return (obj || {})[level];
}, dataObj);
```

#### Try/Catch and arrow function
```javascript
const getValue = (path, defaultValue) => {
  try {
    return path();
  } catch (error) {
    return defaultValue;
  }
};
const value = getValue(() => dataObj.level1.level2.level3.value, 'Not found');
```
