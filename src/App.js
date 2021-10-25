import './App.css';
import {useEffect, useState} from "react";
import * as _ from 'lodash';
import Graph from "react-graph-vis";

function random_rgb() {
    let o = Math.round, r = Math.random, s = 255;
    return 'rgb(' + o(r() * s) + ',' + o(r() * s) + ',' + o(r() * s) + ')';
}

//options for the graph component
const options = {
    layout: {
        hierarchical: false
    },
    edges: {
        color: "#000000"
    }
};

function LinksTable(props) {
    let state = [...props.tableState];

    useEffect(() => {
        return buildGraph()
    }, [props.id]);

    function setLink(x, y) {
        let td = document.getElementById(x + '' + y);
        if (td.innerText === '0') {
            td.innerText = '1';
            state[x][y] = 1;
        } else {
            td.innerText = '0';
            state[x][y] = 0;
        }
        buildGraph()
    }

    function buildGraph() {
        let graph = {
            nodes: [],
            edges: [],
        };

        for (let i = 1; i < state.length; i++) {
            let color = "#b8f9d6"
            if (props.id.length) {
                if (!props.id.find(el => el.id === i - 1)) {
                    color = "#b8f9d6"
                } else {
                    color = props.id.find(el => el.id === i - 1).color
                }
            }

            graph.nodes.push({id: i, label: '  ' + i - 1 + '  ', color: color});
            for (let j = 1; j < state[i].length; j++) {
                if (+state[i][j]) {
                    graph.edges.push({from: i, to: j})
                }
            }
        }

        props.setState({
            counter: graph.nodes.length,
            graph,
        })
    }

    return (
        <div>
            <table>
                <tbody>
                {props.tableState.map((row, index1) => {
                    return (
                        <tr key={index1 + 'tr'}>
                            {row.map((value, index2) => {
                                return (
                                    <td key={index1 + 'td' + index2} id={index1 + '' + index2}
                                        style={{
                                            "backgroundColor": !index1 || !index2 ? '#adf4bc' : ''
                                        }}
                                        onClick={!index1 || !index2 ? null : () => setLink(index1, index2)}>
                                        {value}
                                    </td>
                                )
                            })}
                        </tr>
                    )
                })}
                </tbody>
            </table>
        </div>
    )
}

const App = () => {
    const [state, setState] = useState(null)
    const [id, setId] = useState([])
    const [dfsStr, setDfsStr] = useState([])
    const [colors, setColors] = useState([])
    const [tableState, setTableState] = useState(null);

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const dfs = (method) => {
        let initialVertex = null;

        if (method === 'dfs') {
            initialVertex = Number(document.getElementById('initialVertex2').value)
        } else {
            initialVertex = Number(document.getElementById('initialVertex').value)
        }

        let graphEdges = _.cloneDeep(state.graph.edges),
            graphNodes = _.cloneDeep(state.graph.nodes),
            list = [];

        if (!initialVertex) initialVertex = 0;

        for (let i = 0; i < graphNodes.length; i++) {
            let node = graphNodes[i].id,
                links = graphEdges.filter(edge => edge.from === node)
                    .map(edge => edge.to - 1);

            list.push(links);
        }

        if (method === 'bfs') {
            let level = new Array(list.length).fill(-1)
            let colors = new Array(list.length).fill('');
            colors = colors.map(cl => random_rgb());
            console.log(colors)
            setColors(colors)
            let chain = [0]

            function bfs(s) {
                level[s] = 0
                let queue = [s]

                while (queue.length) {
                    let v = queue.shift()
                    for (const w of list[v]) {
                        if (level[w] === -1) {
                            queue.push(w)
                            chain.push(w)
                            console.log(chain)
                            level[w] = level[v] + 1
                        }
                    }
                }
            }


            for (let i = 0; i < list.length; i++) {
                if (level[i] === -1) {
                    bfs(i)
                }
            }

            let nL = []
            for (let i = 0; i < chain.length; i++) {
                nL.push({id: chain[i], lvl: level[chain[i]], cl: colors[level[chain[i]]]})
            }

            let p = []
            let c = []
            for (let i = 0; i < nL.length; i++) {
                p.push({id: nL[i].id, color: nL[i].cl})
            }

            for (let i = 0; i < p.length; i++) {
                c.push(p.slice(0, i + 1))
            }

            c.map((el, index) => {
                sleep(1000 * index).then(r => {
                    setId(el)
                })
            })
        }

        if (method === 'dfs') {
            const vertexLeavesNotVisitedCount = (list, visited, vertex) => {
                let leaves = list[vertex];
                let count = 0;
                for (let i = 0; i < leaves.length; i++) {
                    if (visited[leaves[i]] === false) count++
                }
                return count
            }

            const all = (list, visited, vertexArr) => {
                let sum = 0;
                vertexArr.map(vertex => {
                    sum += vertexLeavesNotVisitedCount(list, visited, vertex)
                })

                return sum
            }

            let visited = new Array(list.length).fill(false),
                chain = '',
                series = [];


            (function _dfs(list, visited, vertex) {
                return new Promise((resolve, reject) => {
                    chain += (vertex + 1) + ' ';
                    series.push(vertex);
                    visited[vertex] = true;
                    console.log(series)
                    let sum = all(list, visited, series)
                    console.log(sum)
                    let mum = vertexLeavesNotVisitedCount(list, visited, vertex)
                    console.log(mum)

                    if (list[vertex].length) {
                        let printSeries = true;

                        for (let i = 0; i < list[vertex].length; i++) {
                            let nextVertex = Number(list[vertex][i]);


                            if (!visited[nextVertex]) {
                                if (vertexLeavesNotVisitedCount(list, visited, vertex) - 1) {
                                    series = [vertex]
                                }

                                if (sum && !mum) {
                                    printSeries = true;
                                } else {
                                    printSeries = false;
                                }


                                _dfs(list, visited, nextVertex).catch(e => console.log(e))

                            }
                        }

                        if (!sum) printSeries = false;
                        if (sum === 1 && mum === 0) {
                            console.log('+')
                            printSeries = true;
                        }

                        if (printSeries) {
                            series.reverse().map(el => {
                                chain += (el + 1) + ' ';
                                return null
                            });
                            series = [];
                        }
                    } else {
                        let printSeries = true;

                        if (!sum) printSeries = false;
                        // if (sum === 1 && mum === 0) {
                        // }

                        if (printSeries) {
                            series.reverse().map(el => {
                                chain += (el + 1) + ' ';
                                return null
                            });
                            series = [];
                        }
                    }

                    resolve(chain)
                });
            })(list, visited, initialVertex).then(res => {
                // console.log(res)
                console.log(res.trim().split(' ').map(el => Number(el - 1)))
                let arr = res.split(' ');
                window.str = 'route: '
                arr.map((el, index) => {
                    sleep(1000 * index).then(r => {
                        setId([{id: Number(el) - 1, color: '#ed8b8b'}])
                        if ((Number(el) - 1) >= 0) {
                            window.str += ' ➩ ' + (Number(el) - 1)
                            setDfsStr(window.str)
                        }
                    })
                })
            })
        }
    }

    const buildTableState = columnsCount => {
        let state = [];
        for (let i = 0; i < columnsCount; i++) {
            if (!i) {
                state.push(new Array(columnsCount).fill(1).map((el, ind) => {
                    if (!ind) {
                        return null
                    }else {
                        return el * ind - 1
                    }
                }))
            } else {
                state.push(new Array(columnsCount).fill(0).map((el, ind) => {
                    if (ind === 0) {
                        return i - 1
                    } else {
                        return el
                    }
                }))
            }
        }

        setTableState(state);
    };


    const getVerticesCount = () => {
        let count = +document.getElementById('verticesCount').value;
        buildTableState(count + 1)
    };

    const _setState = (data) => {
        setState(data)
    }

    return (
        <div className="App">
            <div className={'menu'}>
                <button onClick={getVerticesCount}>Fill nXn adjacency matrix n:</button>
                <input id={'verticesCount'} type="number" min={0} max={10}/>

                {tableState ? <div>
                    <LinksTable tableState={tableState} setState={_setState} id={id}/>
                </div> : null}


            </div>
            <div className={'methods'}>
                {state ? <div>
                    <button onClick={() => dfs('dfs')}>Depth-first search starting from</button>
                    <select id="initialVertex2">
                        {state.graph.nodes.map((node, index) => {
                            if (!index) {
                                return (
                                    <option selected={true} value={node.id - 1}>{node.id - 1}</option>
                                )
                            }
                            return (
                                <option value={node.id - 1}>{node.id - 1}</option>
                            )
                        })}
                    </select>
                    <div className={'route'}>
                        {dfsStr}
                    </div>
                    <button onClick={() => dfs('bfs')}>Breadth-first search starting from</button>
                    <select id="initialVertex">
                        {state.graph.nodes.map((node, index) => {
                            if (!index) {
                                return (
                                    <option selected={true} value={node.id - 1}>{node.id - 1}</option>
                                )
                            }
                            return null
                        })}

                    </select>
                    {colors.map((cl, index) => {
                        return (
                            <div className={'colors'}>
                                level {index} ➩
                                <input style={{"backgroundColor": cl}} disabled={true} type="text"/>
                            </div>
                        )
                    })}
                </div> : null}
            </div>
            {state ? <div className={'graph'}>
                <Graph graph={state.graph} options={options} style={{height: "640px"}}/>
            </div> : null}
        </div>
    );
};

export default App;
