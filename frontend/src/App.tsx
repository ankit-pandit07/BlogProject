import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import { Signup } from './pages/Signup'
import { Signin } from './pages/Signin'
import { Blog } from './pages/Blog'
import { Blogs } from './pages/Blogs'
import { Publish } from './pages/Publish'
import { EditBlog } from './pages/EditBlog'
import { Profile } from './pages/Profile'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/blogs" />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/blog/:id" element={<Blog />} />
          <Route path="/blogs" element={<Blogs/>} />
          <Route path="/publish" element={<Publish />} />
          <Route path="/edit/:id" element={<EditBlog />} />
          <Route path="/profile/:id" element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
