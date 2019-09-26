import { Database } from "../src/database";
import { minutes } from "./utils";
import { selectActorByName, selectActorById, selectMovieById, selectMovie } from "../src/queries/select";

describe("Update staments", () => {
    let db: Database;

    beforeAll(async () => {
        db = await Database.fromExisting("08", "09");
    }, minutes(3));

    it("should update one actor name by actor id", async done => {
        const actor = await db.selectSingleRow(selectActorByName("Tom Hardy"));
        const query = `
        UPDATE actors
        SET full_name = 'Hardy Tom'
        WHERE id = ${actor.id};
        `;
        try {
            await db.execute(query);
          } catch (e) { console.log(e); };
        
        const row = await db.selectSingleRow(selectActorById(actor.id));
        expect(row).toEqual({
            full_name: "Hardy Tom"
        });
        done();
    });

    it("should update movie title and tagline by movie id", async done => {
        const movieId = 4;
        const query = `
        UPDATE movies
        SET original_title = 'Star Wars: Force Awakens',
            tagline = 'Force awakes in every generation.'
        WHERE id = ${movieId};
        `;
        try {
            await db.execute(query);
          } catch (e) { console.log(e); };

        const movie = await db.selectSingleRow(selectMovieById(movieId));
        expect(movie).toEqual({
            original_title: 'Star Wars: Force Awakens',
            tagline : 'Force awakes in every generation.'
        });
        done();
    });

    it("should update all genres to uppercase", async done => {
        const query = `
        UPDATE genres
        SET genre = UPPER(genre);
        `;
        try {
            await db.execute(query);
          } catch (e) { console.log(e); };
        
       const rows = await db.selectMultipleRows(`SELECT genre FROM genres ORDER BY id DESC`);
       for (const row of rows){
           if (row.genre !== row.genre.toUpperCase()){
               throw new Error (`Genre '${row.genre}' is not in upper case!`)
           };
       };
    done();
    });
});