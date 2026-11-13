import { useEffect, useRef, useState } from "react";
import { Star, MapPin, X, Plus } from "lucide-react";
import type { City } from "../types";
import { addFavourite, write } from "../utils/storage";
export function FavouritesPanel({
  city,
  favourites,
  setFavourites,
  setCity,
}: {
  city: City;
  favourites: City[];
  setFavourites: (cities: City[]) => void;
  setCity: (city: City) => void;
}) {
  const [remove, setRemove] = useState<City | null>(null);
  const dialog = useRef<HTMLDialogElement>(null),
    restoreFocus = useRef<HTMLElement | null>(null);
  const saved = favourites.some((c) => c.id === city.id);
  useEffect(() => {
    if (remove) dialog.current?.showModal();
  }, [remove]);
  function closeDialog() {
    dialog.current?.close();
    setRemove(null);
    if (restoreFocus.current?.isConnected) restoreFocus.current.focus();
  }
  return (
    <>
      <section className="panel favourites">
        <div className="section-heading">
          <div>
            <div className="eyebrow">YOUR PLACES</div>
            <h2>
              Favourite cities <span>{favourites.length}/5</span>
            </h2>
          </div>
          <Star size={19} />
        </div>
        <p className="section-copy">A shortcut to the places you care about.</p>
        {favourites.length ? (
          <ul>
            {favourites.map((c) => (
              <li key={c.id} className={c.id === city.id ? "selected" : ""}>
                <button className="favourite-city" onClick={() => setCity(c)}>
                  <span className="city-pin">
                    <MapPin size={18} />
                  </span>
                  <span>
                    <strong>{c.name}</strong>
                    <small>{c.country}</small>
                  </span>
                  {c.id === city.id && <span className="selected-dot" />}
                </button>
                <button
                  className="icon-button"
                  aria-label={`Remove ${c.name}`}
                  onClick={(e) => {
                    restoreFocus.current = e.currentTarget;
                    setRemove(c);
                  }}
                >
                  <X size={16} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="favourites-empty">
            <span className="empty-star">
              <Star size={25} />
            </span>
            <strong>Keep your places close.</strong>
            <p>
              Save a city to find its forecast
              <br />
              right here, whenever you need it.
            </p>
          </div>
        )}
        <button
          className="add-city"
          disabled={saved || favourites.length >= 5}
          onClick={() => {
            const next = addFavourite(favourites, city);
            setFavourites(next);
            write("wb-favourites", next);
          }}
        >
          <Plus size={17} />
          {saved
            ? "Current city already saved"
            : favourites.length >= 5
              ? "All five places are filled"
              : "Add current city"}
        </button>
        {favourites.length >= 5 && (
          <p className="fine">Remove a city to make room for another.</p>
        )}
      </section>
      <dialog
        ref={dialog}
        aria-labelledby="remove-title"
        onCancel={(e) => {
          e.preventDefault();
          closeDialog();
        }}
        onClose={() => {
          setRemove(null);
          if (restoreFocus.current?.isConnected) restoreFocus.current.focus();
          else
            document
              .querySelector<HTMLButtonElement>(
                ".favourite-city, .add-city:not(:disabled)",
              )
              ?.focus();
        }}
      >
        <h2 id="remove-title">Remove {remove?.name}?</h2>
        <p>This city will be removed from your favourites.</p>
        <div className="dialog-actions">
          <button autoFocus onClick={closeDialog}>
            Cancel
          </button>
          <button
            className="danger"
            onClick={() => {
              const next = favourites.filter((c) => c.id !== remove?.id);
              setFavourites(next);
              write("wb-favourites", next);
              closeDialog();
            }}
          >
            Remove city
          </button>
        </div>
      </dialog>
    </>
  );
}
