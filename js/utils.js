
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

const monthDays = [
    31,
    28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31
]

export const calculateHours = (startDate, endDate, workingHours = true) => {
    const hoursPerDay = workingHours ? 8 : 24;
    let days = 0;
    const [dS, mS, yS] = startDate;
    const [dE, mE, yE] = endDate;
    let dDay = dE - dS;
    let dMonth = mE - mS;
    let dYear = yE - yS;
    if (dMonth === 0 && dYear === 0) days += dE - dS;
    if (dMonth !== 0 && dYear === 0) {
        days += getDaysByMonths(mS, mE-1, dS);
        days += dE;
    }
    if (dYear !== 0) {
        days += getDaysByMonths(mS, 12, dS);
        days += getDaysByMonths(1, mE-1);
        days += dE;
        days += (dYear - 1) * 365;
    }
    if (workingHours) {
        let workedDays = days - Math.floor(days/7)*2;
        let workedHours = workedDays * hoursPerDay;
        return workedHours
    }
    return days*hoursPerDay;
}

const getDaysByMonths = (initM, endM, initMDays = 0) => {
    let d = 0;
    for (let i=initM; i<=endM; i++) {
        if (i === initM) {
            d += monthDays[i] - initMDays;
        } else {
            d += monthDays[i];
        }
    }
    return d;
}

console.log(calculateHours(
    [2023,4,14],
    [2023,4,15],
))