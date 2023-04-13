
export const insert = (parent, elements) => {
    if(typeof(elements.length) !== 'undefined') {
      elements.map(element => parent.appendChild(element));
    } else {
      parent.appendChild(elements);
    }
  }
  
export const create = (elementName, parameters = null) => {
    let element = document.createElement(elementName);
    if(parameters) {
        insertParameters(element, parameters);
        if(parameters.style) {
        insertStyle(element, parameters.style);
        }
    }
    return element;
}

export const insertParameters = (element, parameters) => {
    Object.keys(parameters).map(key => element[key] = parameters[key]);
}

export const insertStyle = (element, parameters) => {
    Object.keys(parameters).map(key => element['style'][key] = parameters[key]);
}

export const sorting = (arr) => {   
    let arr_sort = [arr[0]];
    let indexes = [0];
    arr.shift();
    for (let i=0; i<arr.length; i++) {
        let inserted = false;
        let c=0;
        
        while(!inserted && c<arr_sort.length) {
            if (arr[i]>arr_sort[c]) {
                arr_sort.splice(c,0,arr[i]);
                indexes.splice(c,0,i+1);
                inserted = true;
            }
            c+=1
        }
        if (c===arr_sort.length && !inserted) {
            arr_sort.push(arr[i]);
            indexes.push(i+1);
        }
    }
    return [
        arr_sort,
        indexes
    ]
}