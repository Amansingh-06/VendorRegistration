import { Link } from "react-router-dom"
import SearchInput from "../../components/SearchInput"
import { FiArrowLeft } from "react-icons/fi"
import AddressBook from "../../components/Addressbook"

const Address = () => {
    return (
        <div>
            <div className="w-[95%] lg:w-[90%] mx-auto mt-5 lg:mt-6">
                <div className="flex items-center gap-4 mb-3 lg:mb-6">
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 text-orange rounded-full text-xl lg:text-2xl font-bold shadow-md hover:shadow-xl hover:scale-95 transition-all duration-200 bg-white border border-gray-200"
                    >
                        <FiArrowLeft />
                    </Link>
                    <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-dark tracking-tight">
                        Your Address
                    </h1>
                </div>
                <SearchInput py={'py-4'} placeholder={'Search for area, street name, landmark etc'} />
            </div>
            <div>
                <AddressBook />
            </div>
        </div>
    )
}
export default Address