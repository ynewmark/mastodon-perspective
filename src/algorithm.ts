type Item = {
    value: number,
    name: string,
    tags?: string[]
};

type Data = {
    [id: string]: {
        items: Item[],
        names: {
            [id: string]: number
        }
    };
}

const data: Data = {
    "length": {
        "items": [
            {"value": 1.70688, "name": "average height of an adult male"},
            {"value": 33, "name": "length of the longest-known blue whale"},
            {"value": 52, "name": "height of the Niagara Falls"},
            {"value": 93.47, "name": "height of the Statue of Liberty"},
            {"value": 105, "name": "length of a typical football field"}
        ],
        "names": {
            "meter": 1,
            "metre": 1,
            "meters": 1,
            "metres": 1,
            "kilometer": 1000,
            "kilometre": 1000,
            "kilometers": 1000,
            "kilometres": 1000,
            "inch": 0.0254,
            "inches": 0.0254,
            "foot": 0.3048,
            "feet": 0.3048,
            "yard": 0.9144,
            "yards": 0.9144,
            "mile": 1609.34,
            "miles": 1609.34
        }
    },
    "mass": {
        "items": [
            {
                "name": "adult male",
                "value": 70
            },
            {
                "name": "mature male lion",
                "value": 180
            },
            {
                "name": "typical passanger car",
                "value": 1300
            }
        ],
        "names": {
            "kg": 1,
            "kilogram": 1,
            "kilograms": 1,
            "kilo": 1,
            "kilos": 1,
            "gram": 0.001,
            "grams": 0.001,
            "ounce": 0.0283495,
            "oz": 0.0283495,
            "pound": 0.453592,
            "lb": 0.453592,
            "pounds": 0.453592,
            "milligram": 0.000001,
            "mg": 0.000001,
            "milligrams": 0.000001,
            "mgs": 0.000001,
            "ton": 907.1847,
            "tons": 907.1847
        }
    }
}

function close_to(a: number, b: number): boolean {
    const diff = Math.abs(a - b);
    return diff < 0.1 * a && diff < 0.1 * b;
}

function get_type(unit: string): string | null {
    for (const [name, {names}] of Object.entries(data)) {
        if (Object.hasOwn(names, unit)) {
            return name;
        }
    }
    return null;
}

function normalize(units: {[id: string]: number}, unit: string, value: number): number {
    return units[unit] * value;
}

export function calculate(unit: string, value: number): {"name": string, "count": number} | null {
    const type = get_type(unit);
    if (type == null) {
        return null;
    }
    const items: Item[] = data[type].items;
    value = normalize(data[type].names, unit, value);
    for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        if (item.value < value || close_to(item.value, value)) {
            if (close_to(value, item.value * Math.round(value / item.value))) {
                return {"name": item.name, "count": Math.floor(value / item.value)};
            }
        }
    }
    return null;
}
