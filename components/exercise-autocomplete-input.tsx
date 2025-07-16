import { useEffect, useState } from "react";
import { Input } from "./ui/input";
import { exerciseSuggestions } from "@/lib/workouts";

interface Exercise {
  id: string;
  name: string;
}

export const ExerciseAutocompleteInput = ({
  exercise,
  handleChange,
  isMobile,
}: {
  exercise: Exercise;
  handleChange: (id: string, value: { name: string; id: string }) => void;
  isMobile: boolean;
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Exercise[]>([]);
  const [justSelected, setJustSelected] = useState(false);

  useEffect(() => {
    if (justSelected) {
      setJustSelected(false);
      return;
    }
    const fetchSuggestions = async () => {
      if (query.trim().length === 0) return setSuggestions([]);
      try {
        const res = await exerciseSuggestions(query);

        if (!res) return;

        setSuggestions(res?.data ?? []);
      } catch (error) {
        setSuggestions([]);
        console.log(error);
      }
    };

    const debounceTimeout = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const selectSuggestion = (suggestion: Exercise) => {
    setQuery(suggestion.name);
    handleChange(exercise.id, suggestion);
    setSuggestions([]);
    setJustSelected(true);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    handleChange(exercise.id, { name: e.target.value, id: "" });
  };

  return (
    <div className={`relative w-full mr-2 ${isMobile && "mr-2"}`}>
      <Input
        className="border-gray-200 bg-white"
        value={query}
        onChange={handleInput}
        placeholder={`${exercise.name}` || `Exercise`}
      />
      {suggestions.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full bg-white border rounded shadow">
          {suggestions.map((sug) => (
            <li
              key={sug.id}
              className="p-2 cursor-pointer hover:bg-gray-100"
              onClick={() => selectSuggestion(sug)}
            >
              {sug.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
