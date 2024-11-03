import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import ClipLoader from "react-spinners/ClipLoader";
import { fetchCepData } from "@/utils/data-services";
import TextField from "@mui/material/TextField";
import { Button } from "@mui/material";

// Defina o esquema Zod para o formulário
const addressSchema = z.object({
  cep: z
    .string()
    .min(8, { message: "CEP deve ter 8 dígitos" })
    .max(8, { message: "CEP deve ter 8 dígitos" })
    .regex(/^[0-9]{8}$/, { message: "CEP inválido" }),
  numero: z.string().nonempty("Campo Obrigatório"),
});

// Configurações de estilo para o ClipLoader
const override = {
  display: "block",
  margin: "0 auto",
};

// Cor principal do tema
const color = "#e0782f";

// Estilos para o TextField
const styleTextField = {
  "& label.Mui-focused": {
    color: color, // Cor do label quando focado
  },
  "& .MuiOutlinedInput-root": {
    "&:hover fieldset": {
      borderColor: color, // Cor da borda ao passar o mouse
    },
    "&.Mui-focused fieldset": {
      borderColor: color, // Cor da borda quando focado
    },
  },
};

function AddressForm({ setCepError, setCepData, setShowInputs }) {
  // State que controla o estado de carregamento da requisição do CEP
  const [isLoading, setIsLoading] = useState(false);

  // Use `zodResolver` para integrar Zod ao react-hook-form
  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm({
    resolver: zodResolver(addressSchema),
  });

  // Função que é chamada quando o formulário é submetido
  async function onSubmit({ cep, numero }) {
    setIsLoading(true);
    // Fazer a requisição para a API de CEP
    const { endereco, error } = await fetchCepData(cep, numero);
    setIsLoading(false);

    // Atualizar o estado do componente pai
    // Se houver erro, exibir mensagem de erro e mostrar os inputs
    if (error) {
      setCepError(error);
      setCepData(null);
    } else {
      setCepData(endereco);
      setCepError(null);
      setShowInputs(false); // Ocultar inputs após sucesso na requisição
    }
  }

  return (
    <form
      className="mt-4 flex flex-col gap-4"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Controller
        name="cep"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <TextField
            {...field}
            label="CEP"
            variant="outlined"
            fullWidth
            inputProps={{ maxLength: 8 }}
            error={!!errors.cep} // Definir erro com base no estado do formulário
            helperText={
              errors.cep ? errors.cep.message : "Por favor, digite seu CEP"
            } // Exibir mensagem de erro ou de ajuda
            size="small"
            sx={styleTextField}
          />
        )}
      />

      <Controller
        name="numero"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <TextField
            {...field}
            label="Número"
            variant="outlined"
            fullWidth
            error={!!errors.numero} // Definir erro com base no estado do formulário
            helperText={
              errors.numero
                ? errors.numero.message
                : "Por favor, digite o número"
            } // Exibir mensagem de erro ou de ajuda
            size="small"
            sx={styleTextField}
          />
        )}
      />

      <Button
        variant="contained"
        size="small"
        type="submit"
        sx={{
          backgroundColor: "#e0782f",
          color: "#1a1a1a",
          fontWeight: "bold",
          width: "100%",
          fontFamily: "Calistoga",
          letterSpacing: "2px",
          "&:hover": {
            backgroundColor: "#d16025",
            color: "#fdf7ef",
          },
        }}
      >
        {isLoading ? (
          <ClipLoader color="#fdf7ef" size={20} cssOverride={override} />
        ) : (
          "Buscar"
        )}
      </Button>
    </form>
  );
}

export default AddressForm;
