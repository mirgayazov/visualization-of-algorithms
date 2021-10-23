import './App.css';
import {useEffect, useState} from "react";
import * as _ from 'lodash';
import Graph from "react-graph-vis";

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
            if (i === props.id) {
                color = "#aa5cdc"
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
    const [id, setId] = useState(null)
    const [tableState, setTableState] = useState(null);

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const dfs = () => {
        let start = Number(document.getElementById('start').value);
        if (!start) {
            start = 0
        }
        let edges = _.cloneDeep(state.graph.edges);
        let nodes = _.cloneDeep(state.graph.nodes);
        let adj_list = [];

        for (let i = 0; i < nodes.length; i++) {
            let node = nodes[i].id
            let links = edges.map(edge => {
                if (edge.from === node) return edge.to - 1
            })
            adj_list.push(links.filter(link => link !== undefined))
        }
        let visited = new Array(adj_list.length).fill(false);

        let chain = '';
        let series = [];

        (function sdfs(adj_list, visited, v) {
            return new Promise((resolve, reject) => {
                // setId(v)
                // console.log(v)
                chain += (v + 1) + ' '
                series.push(v)
                visited[v] = true
                console.log(series)
                if (adj_list[v]) {
                    let code = true;
                    for (let i = 0; i < adj_list[v].length; i++) {
                        let w = Number(adj_list[v][i])
                        if (visited[w] === false) {
                            // if (adj_list[v].filter(el => el !== w).length > 0) {
                            //     series = [v]
                            //     code = true
                            // } else {
                            //     code = false
                            // }
                            code = false
                            sdfs(adj_list, visited, w)
                        }
                        // else if (w === start) {
                        //         code = false
                        //     }
                    }
                    if (code) {
                        series.reverse().map(el => {
                            chain += (el + 1) + ' '
                            // setId(el)
                            // console.log(el)
                        })
                        series = []
                    }
                }

                resolve(chain)
            });
        })(adj_list, visited, start).then(res => {
            // console.log(res)
            console.log(res.trim().split(' ').map(el => Number(el - 1)))
            let arr = res.split(' ');
            arr.map((el, index) => {
                sleep(1000 * index).then(r => {
                    setId(Number(el))
                })
            })
            // setProcChain(res)
            // console.log(res)
        })
    }

    const buildTableState = columnsCount => {
        let state = [];
        for (let i = 0; i < columnsCount; i++) {
            if (!i) {
                state.push(new Array(columnsCount).fill(1).map((el, ind) => el * ind - 1))
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
                <input id={'verticesCount'} type="number" min={0} max={10}/>
                <button onClick={getVerticesCount}>Настроить связи</button>
                <input id={'start'} type="number"/>
                <button onClick={dfs}>dfs</button>
                {tableState ? <div>
                    <LinksTable tableState={tableState} setState={_setState} id={id}/>
                </div> : null}
            </div>
            {state ? <div className={'graph'}>
                <Graph graph={state.graph} options={options} style={{height: "640px"}}/>
            </div> : null}
        </div>
    );
};

export default App;
