import Navbar from '../components/Navbar';
import Header from '../components/Header';
import { Outlet, useLocation } from 'react-router-dom';

const pageTitles = {
  '/add-items': 'Add Item',
  '/manage-items': 'Manage Items',
  '/profile': 'Profile',
  '/earning': 'Earning',
};

const Layout = () => {
  const location = useLocation();
  const pathname = location.pathname;

  const isOrderPage = pathname === '/home';
  const isEditMode = location.state?.itemData !== undefined;

  // ✅ Set dynamic title for Add/Edit
  const title =
    pathname === '/add-items'
      ? isEditMode
        ? 'Edit Item'
        : 'Add Item'
      : pageTitles[pathname] || 'Dashboard';

  return (
    <>
      {isOrderPage ? <Navbar /> : <Header title={title} />}
      <div className="pt-[30px] pb-10">
        <Outlet />
      </div>
    </>
  );
};

export default Layout;
