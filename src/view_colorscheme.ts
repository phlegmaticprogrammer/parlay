
export function colorview(width : string, color : string) : Node {
    const node = document.createElement("div");
    const text = document.createTextNode(color);
    node.appendChild(text);
    node.style.backgroundColor = `var(--text-${color})`;
    node.style.color = color.startsWith("bg") ? "var(--text-foreground)" : "var(--text-background)";
    node.style.width = width;
    node.style.height = "50px";
    node.style.padding = "10px";
    node.style.display = "inline-block";
    return node;
}

export function colorline(width:string, ...colors : string[]) : Node {
    const node = document.createElement("div");
    for (const color of colors)
        node.appendChild(colorview(width, color));
    return node;
}

export function viewColorScheme(colorscheme : string) : Node {
    const node = document.createElement("div");
    node.classList.add(colorscheme);
    node.style.padding = "10px";
    node.style.fontFamily = "Helvetica Neue";
    node.style.fontSize = "12px";
    const W = 132 * 7 + 22;
    node.style.width = `${W}px`;
    node.style.backgroundColor = "var(--text-background)";
    node.style.color = "var(--text-foreground)";
    node.style.margin = "10px";
    node.style.border = "solid 1px var(--text-bg1)";
    const title = document.createElement("h2");
    title.appendChild(document.createTextNode(colorscheme));
    title.style.marginBottom = "10px";
    node.appendChild(title);
    
    node.appendChild(colorline("132px", "red", "orange", "yellow", "green", "cyan", "blue", "purple"));
    node.appendChild(colorline("132px", "red-dimmed", "orange-dimmed", "yellow-dimmed", "green-dimmed", "cyan-dimmed", "blue-dimmed", "purple-dimmed"));
    const w = 132 * 7 / 11;
    node.appendChild(colorline(`${w}px`, "bg0", "bg1", "bg2", "bg3", "bg4", "gray", "fg4", "fg3", "fg2", "fg1", "fg0"));
    return node;
}