export const getChangedFields = (oldData, newData) => {
    const changed = {};
  
    for (const key in newData) {
      let oldVal = oldData[key];
      let newVal = newData[key];
  
      if (Array.isArray(oldVal) || Array.isArray(newVal)) {
        oldVal = Array.isArray(oldVal) ? oldVal.sort().join(",") : String(oldVal);
        newVal = Array.isArray(newVal) ? newVal.sort().join(",") : String(newVal);
      } else {
        oldVal = oldVal !== null && oldVal !== undefined ? String(oldVal).trim() : "";
        newVal = newVal !== null && newVal !== undefined ? String(newVal).trim() : "";
      }
  
      if (oldVal === newVal) continue;
  
      if ((oldVal === "NA" && newVal === "") || (oldVal === "" && newVal === "NA")) continue;
  
      changed[key] = { before: oldVal, after: newVal };
    }
  
    return changed;
  };
  
 export const generateChangeDescription = (changes) => {
    return Object.entries(changes)
      .map(([key, value]) => `${key} changed from "${value.before}" to "${value.after}"`)
      .join(", ");
  };
  