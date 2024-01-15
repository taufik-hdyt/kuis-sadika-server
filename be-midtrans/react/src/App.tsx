/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from 'react'
import './App.css'
import axios from 'axios'

declare global {
  interface Window {
    snap: any
  }
}

type packageType = 'silver' | 'gold' | 'platinum'

function App() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [packageType, setPackageType] = useState<packageType>('silver')
  const [token, setToken] = useState('')

  const packageQuantities: Record<packageType, number> = {
    silver: 50,
    gold: 100,
    platinum: 200
  }

  const packagePrices: Record<packageType, number> = {
    silver: 50000,
    gold: 100000,
    platinum: 200000
  }


  // MENGGUNAKAN REDIRECT URL
  const process = async () => {
    const diamond_quantity = packageQuantities[packageType]
    const diamond_price = packagePrices[packageType]
    const diamond_package = packageType

    const data = {
      name: name,
      email: email,
      diamond_name: diamond_package,
      diamond_quantity: diamond_quantity,
      diamond_price: diamond_price,
      custom_data: {
        email: email,
        diamond_quantity: diamond_quantity,
      },
    }

    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    }


    const response = await axios.post(
      import.meta.env.VITE_REACT_APP_PAYMENT_API,
      data,
      config
    )
    // setToken(response.data.data.token)
    console.log(response.data);


    // Dapatkan payment_url dari respons backend
    const payment_url = response.data.payment_url;

    // Redirect pengguna ke payment_url
    window.location.href = payment_url;
  }


  type UserType = {
    id: number;
    email: string;
    fullname: string;
    username: string;
    diamond: number;
  };
  const [userData, setUserData] = useState<UserType[]>([])

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/v1/users`)
        setUserData(response.data.users)
      }
      catch (error) {
        console.log(`Error fetching user data`, error)
      }
    }

    fetchUserData()
  }, [])

  // console.log('USER DATA: ', userData);



  return (
    <>
      <div style={{ border: '1px solid black', padding: '10px' }}>
        <div className="input-group mb-3">
          <span className="input-group-text" id="inputGroup-sizing-large" style={{ width: '150px' }}>Nama</span>
          <input type="text" className="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default"
            value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="input-group mb-3">
          <span className="input-group-text" id="inputGroup-sizing-large" style={{ width: '150px' }}>Email</span>
          <input type="text" className="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default"
            value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="input-group mb-3">
          <span className="input-group-text" id="inputGroup-sizing-default" style={{ width: '150px' }}>Paket</span>
          <select className="form-control" value={packageType} onChange={(e) => setPackageType(e.target.value as 'silver' | 'gold' | 'platinum')}>
            <option value="silver">Silver</option>
            <option value="gold">Gold</option>
            <option value="platinum">Platinum</option>
          </select>
        </div>

        <div className="input-group mb-3">
          <span className="input-group-text" id="inputGroup-sizing-default" style={{ width: '150px' }}>Jumlah</span>
          <input type="text" className="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default"
            value={packageQuantities[packageType] + ' Diamonds'} disabled />
        </div>

        <div className="input-group mb-3">
          <span className="input-group-text" id="inputGroup-sizing-default" style={{ width: '150px' }}>Harga Total</span>
          <input type="text" className="form-control" aria-label="Sizing example input" aria-describedby="inputGroup-sizing-default"
            value={'Rp. ' + Number(packagePrices[packageType]).toLocaleString()} onChange={(e) => setEmail(e.target.value)} disabled />
        </div>


        <div className='d-flex justify-content-start'>
          <button type="button" className="btn btn-primary" onClick={process}>Proses</button>
        </div>
      </div>

      {/* User table */}
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Full Name</th>
            <th>Username</th>
            <th>Diamond</th>
          </tr>
        </thead>
        <tbody>
          {userData.map((user: UserType) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.email}</td>
              <td>{user.fullname}</td>
              <td>{user.username}</td>
              <td>{user.diamond}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
export default App

// https://www.google.com/search?q=jari+kaki+trauma+benda+keras+kuku+goyang&sca_esv=585436030&ei=jmxjZY_XD9KO4-EP_IaF2Aw&ved=0ahUKEwiP1ra5heKCAxVSxzgGHXxDAcsQ4dUDCBA&uact=5&oq=jari+kaki+trauma+benda+keras+kuku+goyang&gs_lp=Egxnd3Mtd2l6LXNlcnAiKGphcmkga2FraSB0cmF1bWEgYmVuZGEga2VyYXMga3VrdSBnb3lhbmcyCBAAGIAEGKIEMggQABiABBiiBDIIEAAYgAQYogQyCBAAGIAEGKIEMggQABiABBiiBEisClDSBFiHBnACeAGQAQCYAWigAeQCqgEDMy4xuAEDyAEA-AEBwgIKEAAYRxjWBBiwA8ICChAhGKABGMMEGAriAwQYACBBiAYBkAYI&sclient=gws-wiz-serp
// https://www.alodokter.com/komunitas/topic/kuku-menghitam-4
