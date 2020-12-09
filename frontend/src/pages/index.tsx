import React, { useState } from "react"
import { useQuery, useMutation } from '@apollo/client';
import gql from 'graphql-tag';
import shortid from "shortid"
// materil ui tasks//////////////////////////////////////////////////////////////
import { withStyles, Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';


const useStyles = makeStyles((theme: Theme) =>
  createStyles({

    table: {
      minWidth: 650,
    },

  }),
);
const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    head: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    body: {
      fontSize: 14,
    },

  }
  ),
)(TableCell);
const StyledTableRow = withStyles((theme: Theme) =>
  createStyles({
    root: {
      '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
      },
    },
  }),
)(TableRow);








// This query is executed at run time by Apollo.
const GET_TODOS = gql`
  query {
    listNotes {
      id
      name
      completed
    }
  }
`



const ADD_TODO = gql`
mutation createNote($note:NoteInput)
{
  createNote(note:$note)
{
      id
      name
      completed
}
}
`
const DELETE_TASK = gql`
mutation deleteNote($noteId: String) {
  deleteNote(noteId: $noteId) {
    id
    name
    completed
 
  }
}

`
export default function Home() {

  const classes = useStyles();

  const [name, setName] = useState("")
  const [completed, setCompleted] = useState(false)
  const [createNote] = useMutation(ADD_TODO)
  const [deleteNote] = useMutation(DELETE_TASK)
  // const [updateTodo] = useMutation(UPDATE_TODO);
  const { loading, error, data } = useQuery(GET_TODOS);

  const handleSubmit = async () => {
    const note = {
      id: shortid.generate(),
      name,
      completed: false,
    }
    console.log("Creating Todo:", note)
    // setTitle("")
    const test = await createNote({
    
      variables: {
        
        note,
      },
    })
    console.log(test)

  }

  const deleteTask = (e) => {
    e.preventDefault()
    console.log(JSON.stringify(e.currentTarget.value))
    deleteNote({
      variables: {
        noteId: e.currentTarget.value,
      },
      refetchQueries: [{ query: GET_TODOS }]
    })

  }


  if (loading)
    return <h2>Loading.....</h2>

  return (
    <div>

      <label>
        <h1> Add Task </h1>

        <input
          value={name}
          onChange={({ target }) => setName(target.value)}
        />

      </label>



      <Button variant="contained" color="primary" onClick={() => handleSubmit()}>Add Task</Button>

      <br /><br /><br />
      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <StyledTableCell>ID</StyledTableCell>
              <StyledTableCell>TASK</StyledTableCell>
              <StyledTableCell>STATUS</StyledTableCell>
              <StyledTableCell>DELETE</StyledTableCell>

            </TableRow>
          </TableHead>
          <TableBody>

            {!loading &&
              data && data.listNotes.map((da) => (
                <StyledTableRow key={da.id}>
                  <StyledTableCell>
                    {da.id}
                  </StyledTableCell>
                  <StyledTableCell >{da.name}</StyledTableCell>
                  <StyledTableCell>{da.completed.toString()}</StyledTableCell>

                  <StyledTableCell>

                    <Button variant="contained" color="secondary" onClick={deleteTask} value={da.id}>
                      DeleteTask
                       </Button>

                  </StyledTableCell>

                </StyledTableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>


    </div>
  );

}
