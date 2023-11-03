import * as d3 from 'd3';
import React, { useEffect, useState, useRef } from 'react'
import axios from "axios"


const App = () => {
  
   const coins =  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=gecko_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h"
   const [data, setPosts] = useState([]);
   
   useEffect(() => {
     axios.get(coins)
       .then(response => {
         setPosts(response.data);
       })
       .catch(error => {
         console.error(error);
       });
   },[]);
   
       
   const svgRef = useRef();

  useEffect(() => {
    if (data.length === 0) return;
   // Specify the dimensions of the chart.
  const width = 1080;
  const height = 600;
  const margin = 1; // to avoid clipping the root circle stroke
  const name = d => d.id; // "Strings" of "flare.util.Strings"
  const names = d => {
    const n = name(d);
    return n ? n.split(/(?=[A-Z][a-z])|\s+/g) : []; // Check if n is not undefined before splitting
  } // ["Legend", "Item"] of "flare.vis.legend.LegendItems"
  
  // Specify the number format for values.
  // const format = d3.format(".2%");
  const format = d3.format('.2%');
  
  // Create a categorical color scale.
  const color = d3.scaleOrdinal()
    .domain(["negative", "positive"])
    .range(["red", "green"]);
  
    // Create a scale values for great visulization
    const scaleBubble = d3.scaleLinear()
    .domain([0.01, 100]) 
    .range([18, 60]);
    
  // Create the pack layout.
  const pack = d3.pack()
    .size([width - margin * 2, height - margin * 2])
    .padding(3)
  
  // Compute the hierarchy from the (flat) data; expose the values
  // for each node; lastly apply the pack layout.
  const root = pack(d3.hierarchy({ children: data })
    .sum(d => Math.abs(d.price_change_percentage_24h)));
  
  // Create the SVG container.
  const svg = d3.select(svgRef.current)
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [-margin, -margin, width, height])
    .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;")
    .attr("text-anchor", "middle");
  
  // Place each (leaf) node according to the layout’s x and y values.
  const node = svg.append("g")
    .selectAll()
    .data(root.leaves())
    .join("g")
    .attr("transform", d => `translate(${d.x},${d.y})`);
  
  // Add a title.
  node.append("title")
    .text(d => `${d.data.id}\n${d.data.price_change_percentage_24h}`);
  
  // Add a filled circle.
  node.append("circle")
  .attr("fill-opacity", 0.55)
  .attr("stroke", d => d.data.price_change_percentage_24h < 0 ? "#fa0505" : "#2efa05") // Add a black stroke to the circles
  .attr("stroke-width", 1.6) // Set the stroke width to 2
  .attr("fill", d => d.data.price_change_percentage_24h < 0 ? color("negative") : color("positive"))
  .attr("r", d => scaleBubble(Math.abs(d.data.price_change_percentage_24h)));
  
  // Add a label.
  const text = node.append("text")
    .attr("clip-path", d => {
          const radius = scaleBubble(Math.abs(d.data.price_change_percentage_24h));
          return `circle(${radius})`;
          });
  
  // Add a tspan for each CamelCase-separated word.
  text.selectAll()
    .data(d => names(d.data))
    .join("tspan")
    .attr("x", 0)
    .attr("y", (d, i, nodes) => `${i - nodes.length / 2 + 0.35}em`)
    .text(d => d);
  
  // Add a tspan for the node’s value.
  text.append("tspan")
    .attr("x", 0)
    .attr("y", d => `${names(d.data).length / 2 + 0.35}em`)
    .attr("fill-opacity", 0.7)
    .text(d => format(Math.abs(d.data.price_change_percentage_24h/100)));
  
  
  }, [data]);


  return <svg ref={svgRef}></svg>;
   
 };

 export default App;
