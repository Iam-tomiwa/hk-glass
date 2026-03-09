import { useEffect, useRef } from "react";
import { Input, InputProps } from "./ui/input";
import { SearchIcon } from "lucide-react";

function SearchInput(props: InputProps) {
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
				event.preventDefault(); // Prevent default browser behavior
				inputRef.current?.focus(); // Focus on the input
			}
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, []);

	return (
		<Input
			{...props}
			startIcon={<SearchIcon className="pr-2 size-6" />}
			ref={inputRef} // Attach the ref to the input
			placeholder={props.placeholder || "Search"}
		/>
	);
}

export default SearchInput;
