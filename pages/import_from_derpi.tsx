import AppBar from '../components/AppBar'
import db_ops from '../server/helpers/db_ops'
import Button from '@material-ui/core/Button';
import axios from 'axios'
import TextField from '@material-ui/core/TextField';

import ErrorPage from 'next/error'
import { useState } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Import_from_derpi(props: any) {
  if (props.err) {
    return <ErrorPage statusCode={404} />
  }
  const [ImageID, setID] = useState(0);
  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.keyCode === 13 || e.which === 13) {
      add_image();
    }
  };
  const add_image = () => {
    axios(`/import_from_derpi`, {
      method: "post",
      data: { id: ImageID },
      withCredentials: true
    }).then((resp) => {
      alert(JSON.stringify(resp.data))
      setID(0)
    }).catch((err) => {
      alert('check console for error message')
      console.log(err)
      setID(0)
    })
  }


  return (
    <div>
      <AppBar />
      <TextField
        value ={ImageID}
        fullWidth
        type="number"
        label="Derpi image id"
        placeholder="Derpi image id"
        margin="normal"
        onChange={(e) => setID(parseInt(e.target.value)||0)}
        onKeyPress={(e) => handleKeyPress(e)}
      />
      <Button onClick={() => { add_image() }} variant="contained" color="primary" >Add image</Button>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getServerSideProps(context: any) {
  if (context.req.session.authed && context.req.session.user_id) {
    const user = await db_ops.activated_user.find_user_by_id(context.req.session.user_id)
    if (user[0].isAdmin) {
      return {
        props: {},
      }
    }
  }
  return {
    props: { err: true },
  }
}
