import dayjs from "../lib/dayjs";
import BrDisplayUser from "./brickroom/BrDisplayUser";
import BrTable from "./brickroom/BrTable";

const ContributorsTable = ({
  contributors,
  date,
  head,
  title,
}: {
  contributors?: { name: string; id: string }[];
  date: any;
  head: string[];
  title?: string;
}) => {
  return (
    <>
      {title && <h3 className="my-2 my-6">{title}</h3>}
      <BrTable headArray={head}>
        {contributors &&
          contributors.map(contributor => (
            <tr key={contributor.id}>
              <td>
                <BrDisplayUser id={contributor.id} name={contributor.name} />
              </td>
              <td>
                <p className="mr-1">{dayjs(date).fromNow()}</p>
                <p className="text-xs">{dayjs(date).format("HH:mm DD/MM/YYYY")}</p>
              </td>
            </tr>
          ))}
      </BrTable>
    </>
  );
};

export default ContributorsTable;
