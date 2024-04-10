import React, { useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../utils/auth';
import axios from 'axios';
import './Home.css';

const Home = () => {
  const UrlData = 'https://us-central1-dataneroun.cloudfunctions.net/api/api/data';
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [layout, setLayout] = useState([
    {
      id: 'item1',
      width: '30%',
      height: '50%',
      x: '15%',
      y: 0,
    },
    {
      id: 'item2',
      width: '70%',
      height: '50%',
      x: '15%',
      y: 0,
    },
    {
      id: 'item3',
      width: '100%',
      height: '50%',
      x: '15%',
      y: '0',
    },
  ]);
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [data, setData] = useState([]);
  const [addCount, setAddCount] = useState(0);
  const [updateCount, setUpdateCount] = useState(0);
  const [updatedName, setUpdatedName] = useState('');
  const [updatedValue, setUpdatedValue] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const storedUser = getUser();
    if (storedUser) {
      setUser(storedUser);
    } else {
      navigate('/login');
    }

    // Load data from local storage
    const storedData = localStorage.getItem('data');
    if (storedData) {
      setData(JSON.parse(storedData));
    }
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${UrlData}/count`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const { counts } = response.data;
        setAddCount(counts.addCount);
        setUpdateCount(counts.updateCount);
      } catch (error) {
        console.error('Error fetching data counts:', error);
      }
    };
    fetchData();
  }, []);

  const handleResize = (id, { width, height, x, y }) => {
    setLayout((prevLayout) =>
      prevLayout.map((item) =>
        item.id === id
          ? {
              ...item,
              width: `${(parseInt(width) / layout[0].width) * 100}%`,
              height: `${(parseInt(height) / layout[0].height) * 100}%`,
              x: item.id === 'item1' ? '0%' : `${(parseInt(x) / layout[0].width) * 100}%`,
              y: item.id === 'item1' ? '0%' : `${(parseInt(y) / layout[0].height) * 100}%`,
            }
          : item
      )
    );

    const currentIndex = layout.findIndex((item) => item.id === id);

    if (currentIndex > 0) {
      const leftItem = layout[currentIndex - 1];
      const leftItemNewWidth = `${
        (parseInt(leftItem.width) + (parseInt(x) - parseInt(leftItem.x))) / layout[0].width * 100
      }%`;

      setLayout((prevLayout) =>
        prevLayout.map((item) =>
          item.id === leftItem.id
            ? {
                ...item,
                width: leftItemNewWidth,
              }
            : item
        )
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${UrlData}`,
        {
          name,
          value,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setData([...data, response.data.data]);
      setAddCount(addCount + 1);
      setName('');
      setValue('');
      // Update local storage with new data
      localStorage.setItem('data', JSON.stringify([...data, response.data.data]));
    } catch (error) {
      console.error('Error submitting data:', error);
    }
  };

  const handleUpdate = async (id) => {
    try {
      const response = await axios.put(
        `${UrlData}/${id}`,
        {
          name: updatedName,
          value: updatedValue,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      setData(
        data.map((item) =>
          item._id === id
            ? {
                ...item,
                name: response.data.data.name,
                value: response.data.data.value,
              }
            : item
        )
      );
      setUpdateCount(updateCount + 1);
      setSelectedItem(null);
      setUpdatedName('');
      setUpdatedValue('');
      // Update local storage with modified data
      localStorage.setItem('data', JSON.stringify(data));
    } catch (error) {
      console.error('Error updating data:', error);
    }
  };

  return (
    <div>
      {user && (
        <div className="home-container">
          <Rnd
            className="rnd-box"
            key="item1"
            default={{
              x: layout[0].x,
              y: layout[0].y,
              width: layout[0].width,
              height: layout[0].height,
            }}
          >
            <h3 className="box-title">
              Add Data <span className="box-count">({addCount})</span>
            </h3>
            <form onSubmit={handleSubmit} className="form-container">
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
              />
              <input
                type="text"
                placeholder="Value"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="form-input"
              />
              <button type="submit" className="form-button">
                Submit
              </button>
            </form>
          </Rnd>

          <Rnd
            className="rnd-box"
            key="item2"
            default={{
              x: layout[1].x,
              y: layout[1].y,
              width: layout[1].width,
              height: layout[1].height,
            }}
            bounds="parent"
            onResize={(_, __, ref, ____) => {
              const width = ref.style.width;
              const height = ref.style.height;
              handleResize('item2', { width, height });
            }}
          >
            <h3 className="box-title">
              Total Counts <span className="box-count">({addCount + updateCount})</span>
            </h3>
            <div className="data-list-container">
              <h4 className="data-list-title">Data List</h4>
              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item) => (
                      <tr key={item._id} className="data-row">
                        <td>{item.name}</td>
                        <td>{item.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Rnd>

          <Rnd
            className="rnd-box"
            key="item3"
            default={{
              x: layout[2].x,
              y: layout[2].y,
              width: layout[2].width,
              height: layout[2].height,
            }}
            bounds="parent"
            onResize={(_, __, ref, ____) => {
              const width = ref.style.width;
              const height = ref.style.height;
              handleResize('item3', { width, height });
            }}
          >
            <h3 className="box-title">
              Update Data <span className="box-count">({updateCount})</span>
            </h3>
            {data.map((item) => (
              <div key={item._id} className="update-container">
                <input
                  type="text"
                  placeholder="Name"
                  defaultValue={item.name}
                  onBlur={(e) => {
                    setUpdatedName(e.target.value);
                    setSelectedItem(item);
                  }}
                  className="update-input"
                />
                <input
                  type="text"
                  placeholder="Value"
                  defaultValue={item.value}
                  onBlur={(e) => {
                    setUpdatedValue(e.target.value);
                    setSelectedItem(item);
                  }}
                  className="update-input"
                />
                {selectedItem && selectedItem._id === item._id && (
                  <button
                    onClick={() => handleUpdate(selectedItem._id)}
                    className="update-button"
                  >
                    Update
                  </button>
                )}
              </div>
            ))}
          </Rnd>
        </div>
      )}
    </div>
  );
};

export default Home;